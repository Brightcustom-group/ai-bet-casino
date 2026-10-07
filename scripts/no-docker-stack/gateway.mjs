// Dev-only gateway: exposes PostgREST and GoTrue under Supabase-style paths
// (/rest/v1, /auth/v1) on one port, like Kong does in `supabase start`.
import http from 'node:http'

const port = Number(process.env.GATEWAY_PORT ?? 54321)
const routes = [
  ['/rest/v1', Number(process.env.POSTGREST_PORT ?? 54331)],
  ['/auth/v1', Number(process.env.GOTRUE_PORT ?? 54329)],
]

http
  .createServer((req, res) => {
    const route = routes.find(([prefix]) => req.url.startsWith(prefix))
    if (!route) {
      res.writeHead(404).end('not found')
      return
    }
    const [prefix, target] = route
    const upstream = http.request(
      { host: '127.0.0.1', port: target, method: req.method, path: req.url.slice(prefix.length) || '/', headers: req.headers },
      (up) => {
        res.writeHead(up.statusCode ?? 502, up.headers)
        up.pipe(res)
      },
    )
    upstream.on('error', () => res.writeHead(502).end('upstream unavailable'))
    req.pipe(upstream)
  })
  .listen(port, '127.0.0.1', () => console.log(`gateway on http://127.0.0.1:${port}`))
