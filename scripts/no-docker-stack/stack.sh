#!/usr/bin/env bash
# Fallback local Supabase stack for machines where `npx supabase start` cannot pull
# images. Development only: Postgres (native) + PostgREST (binary) + GoTrue (container).
# Usage: scripts/no-docker-stack/stack.sh start|reset|stop
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
HERE="$ROOT/scripts/no-docker-stack"
STACK_DIR="${STACK_DIR:-/tmp/ai-bet-casino-stack}"
PG_BIN="${PG_BIN:-/usr/lib/postgresql/16/bin}"
POSTGREST_BIN="${POSTGREST_BIN:-postgrest}"
DB_PORT=54322
JWT_SECRET="${JWT_SECRET:-super-secret-jwt-token-with-at-least-32-characters-long}"
PSQL=(psql -h 127.0.0.1 -p "$DB_PORT" -U postgres -d postgres -v ON_ERROR_STOP=1 -q)

start_db() {
  mkdir -p "$STACK_DIR" && chown postgres "$STACK_DIR"
  if [ ! -d "$STACK_DIR/pgdata" ]; then
    su postgres -c "$PG_BIN/initdb -D $STACK_DIR/pgdata -U postgres --auth=trust >/dev/null"
    FRESH=1
  fi
  su postgres -c "$PG_BIN/pg_ctl -D $STACK_DIR/pgdata -o '-p $DB_PORT -k /tmp' -l $STACK_DIR/pg.log -w start >/dev/null"
  if [ "${FRESH:-0}" = 1 ]; then "${PSQL[@]}" -f "$HERE/bootstrap.sql"; fi
}

start_auth() {
  docker rm -f abc-gotrue >/dev/null 2>&1 || true
  docker run -d --name abc-gotrue --network host \
    -e GOTRUE_API_HOST=127.0.0.1 -e PORT=54329 \
    -e API_EXTERNAL_URL=http://127.0.0.1:54321/auth/v1 \
    -e GOTRUE_SITE_URL=http://localhost:3000 \
    -e GOTRUE_DB_DRIVER=postgres \
    -e "GOTRUE_DB_DATABASE_URL=postgres://supabase_auth_admin:dev-auth-admin@127.0.0.1:$DB_PORT/postgres?search_path=auth" \
    -e "GOTRUE_JWT_SECRET=$JWT_SECRET" -e GOTRUE_JWT_EXP=3600 -e GOTRUE_JWT_AUD=authenticated \
    -e GOTRUE_JWT_DEFAULT_GROUP_NAME=authenticated -e GOTRUE_JWT_ADMIN_ROLES=service_role \
    -e GOTRUE_DISABLE_SIGNUP=true -e GOTRUE_EXTERNAL_EMAIL_ENABLED=true -e GOTRUE_MAILER_AUTOCONFIRM=true \
    supabase/gotrue:v2.197.0 >/dev/null
  for _ in $(seq 1 60); do
    curl -sf http://127.0.0.1:54329/health >/dev/null && return 0
    sleep 1
  done
  echo "GoTrue did not become healthy"; docker logs abc-gotrue | tail -20; exit 1
}

apply_schema() {
  for f in "$ROOT"/supabase/migrations/*.sql; do "${PSQL[@]}" -f "$f"; done
  "${PSQL[@]}" -f "$ROOT/supabase/seed.sql"
  "${PSQL[@]}" -c "notify pgrst, 'reload schema'"
}

start_api() {
  cat > "$STACK_DIR/postgrest.conf" <<CONF
db-uri = "postgres://authenticator:dev-authenticator@127.0.0.1:$DB_PORT/postgres"
db-schemas = "public"
db-anon-role = "anon"
jwt-secret = "$JWT_SECRET"
server-host = "127.0.0.1"
server-port = 54331
CONF
  nohup "$POSTGREST_BIN" "$STACK_DIR/postgrest.conf" >"$STACK_DIR/postgrest.log" 2>&1 &
  echo $! >"$STACK_DIR/postgrest.pid"
  nohup node "$HERE/gateway.mjs" >"$STACK_DIR/gateway.log" 2>&1 &
  echo $! >"$STACK_DIR/gateway.pid"
}

stop_all() {
  for p in postgrest gateway; do
    [ -f "$STACK_DIR/$p.pid" ] && kill "$(cat "$STACK_DIR/$p.pid")" 2>/dev/null || true
    rm -f "$STACK_DIR/$p.pid"
  done
  docker rm -f abc-gotrue >/dev/null 2>&1 || true
  [ -d "$STACK_DIR/pgdata" ] && su postgres -c "$PG_BIN/pg_ctl -D $STACK_DIR/pgdata -m fast stop >/dev/null" || true
}

case "${1:-start}" in
  start)
    start_db
    start_auth
    if [ "$("${PSQL[@]}" -tAc "select to_regclass('public.articles') is null")" = t ]; then apply_schema; fi
    start_api
    echo "API: http://127.0.0.1:54321  DB: postgresql://postgres@127.0.0.1:$DB_PORT/postgres"
    JWT_SECRET="$JWT_SECRET" node "$HERE/keys.mjs"
    ;;
  reset)
    stop_all
    rm -rf "$STACK_DIR/pgdata"
    "$0" start
    ;;
  stop) stop_all ;;
  *) echo "usage: $0 start|reset|stop"; exit 1 ;;
esac
