-- Synthetic development data only. Teams, leagues, people and odds are fictional.
-- Dev accounts (local only, never use in staging/production):
--   admin@aibetcasino.test / editor@aibetcasino.test / reader@aibetcasino.test
--   password: dev-password-123

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
select
  '00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated', u.email,
  extensions.crypt('dev-password-123', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', jsonb_build_object('display_name', u.name),
  now(), now(), '', '', '', ''
from (values
  ('00000000-0000-4000-a000-000000000001'::uuid, 'admin@aibetcasino.test', 'Ayanda Admin'),
  ('00000000-0000-4000-a000-000000000002'::uuid, 'editor@aibetcasino.test', 'Thandi Editor'),
  ('00000000-0000-4000-a000-000000000003'::uuid, 'reader@aibetcasino.test', 'Riaan Reader')
) as u(id, email, name);

insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select id::text, id, jsonb_build_object('sub', id::text, 'email', email, 'email_verified', true),
  'email', now(), now(), now()
from auth.users where email like '%@aibetcasino.test';

update public.profiles set role = 'admin' where id = '00000000-0000-4000-a000-000000000001';
update public.profiles set role = 'editor' where id = '00000000-0000-4000-a000-000000000002';

insert into public.sports (slug, name) values
  ('football', 'Football'), ('cricket', 'Cricket'), ('rugby', 'Rugby'), ('tennis', 'Tennis');

insert into public.leagues (sport_id, slug, name, country)
select s.id, l.slug, l.name, l.country
from (values
  ('football', 'highveld-premier-league', 'Highveld Premier League', 'South Africa'),
  ('football', 'continental-champions-cup', 'Continental Champions Cup', null),
  ('cricket', 'coastal-t20-series', 'Coastal T20 Series', 'South Africa'),
  ('rugby', 'southern-union-championship', 'Southern Union Championship', null)
) as l(sport, slug, name, country)
join public.sports s on s.slug = l.sport;

insert into public.categories (section, slug, name, description) values
  ('sports', 'match-previews', 'Match previews', 'Form, team news and context before kick-off.'),
  ('sports', 'betting-tips', 'Betting tips', 'Reasoned selections with the risks spelled out.'),
  ('sports', 'odds-analysis', 'Odds analysis', 'What decimal odds imply and how markets move.'),
  ('casino', 'slots', 'Slots', 'How slot games work: RTP, volatility and features.'),
  ('casino', 'table-games', 'Table games', 'Rules and house edge for blackjack, roulette and more.'),
  ('responsible_gambling', 'safer-gambling', 'Safer gambling', 'Tools, limits and where to get help.');

-- Articles authored by the seeded editor. published_at is relative to seed time.
insert into public.articles (
  slug, title, excerpt, body, content_type, category_id, sport_id, league_id,
  status, published_at, is_featured, author_id, created_at, updated_at
)
select a.slug, a.title, a.excerpt, a.body, a.content_type::public.content_type,
  c.id, s.id, l.id, a.status::public.content_status, a.published_at, a.featured,
  '00000000-0000-4000-a000-000000000002',
  least(coalesce(a.published_at, now()), now()), least(coalesce(a.published_at, now()), now())
from (values
  ('highveld-rovers-v-cape-coast-united-preview',
   'Highveld Rovers v Cape Coast United: derby preview',
   'Form, injuries and what the decimal odds imply before Saturday''s Highveld Premier League derby.',
   E'Highveld Rovers host Cape Coast United at 15:30 SAST on Saturday. Rovers are unbeaten in five at home, while United have scored in every away game this season.\n\nThe home win is priced around 2.10, which implies roughly a 48% chance once you ignore the bookmaker margin. The draw at 3.30 implies about 30%.\n\nTeam news: Rovers expect their first-choice centre-back back from a hamstring issue. United are without their leading scorer through suspension.\n\nNothing here is a guaranteed outcome. Odds change and form can turn quickly — only stake what you can afford to lose.',
   'preview', 'match-previews', 'football', 'highveld-premier-league', 'published', now() - interval '2 hours', true),
  ('coastal-t20-weekend-tips',
   'Coastal T20 Series: three angles for the weekend',
   'Pitch reports, toss trends and the markets we think are worth a closer look this weekend.',
   E'Batting first has won seven of the last ten matches at the coastal venue, but the evening dew makes chasing easier under lights.\n\nAngle one: the over/under on first-innings runs looks generous given recent scores.\n\nAngle two: watch the toss — teams choosing to bowl have a strong record in night games.\n\nThese are opinions based on public data, not certainties. Set a budget before you bet.',
   'tip', 'betting-tips', 'cricket', 'coastal-t20-series', 'published', now() - interval '1 day', true),
  ('reading-decimal-odds',
   'How to read decimal odds and implied probability',
   'A plain-English guide to decimal odds, implied probability and the bookmaker margin.',
   E'Decimal odds show the total return for every R1 staked, including your stake. Odds of 2.50 return R25 from a R10 stake.\n\nImplied probability is 1 divided by the odds: 1 / 2.50 = 40%.\n\nAdd up the implied probabilities across all outcomes and you will usually get more than 100%. The excess is the bookmaker margin.\n\nUnderstanding odds helps you make informed decisions; it does not remove risk.',
   'odds_analysis', 'odds-analysis', null, null, 'published', now() - interval '3 days', false),
  ('southern-union-final-odds-movement',
   'Southern Union final: how the odds have moved',
   'Tracking the market for the Southern Union Championship final over the past week.',
   E'The favourites opened at 1.65 and have drifted to 1.80 after late team news.\n\nA drift like this often reflects new information or weight of money, not a change in certainty.\n\nWe will update this analysis if the team sheets change before kick-off at 17:00 SAST.',
   'odds_analysis', 'odds-analysis', 'rugby', 'southern-union-championship', 'published', now() - interval '5 hours', false),
  ('slot-rtp-and-volatility-explained',
   'Slot RTP and volatility explained',
   'What return-to-player and volatility really mean, and why no slot strategy beats the house edge.',
   E'RTP (return to player) is a long-run average across millions of spins. A 96% RTP does not mean you get R96 back from every R100.\n\nVolatility describes how wins are distributed: low volatility pays small amounts often; high volatility pays larger amounts rarely.\n\nEvery spin is independent. There is no pattern to exploit and no strategy that guarantees a win.',
   'casino_guide', 'slots', null, null, 'published', now() - interval '2 days', true),
  ('blackjack-basics-house-edge',
   'Blackjack basics and the house edge',
   'The rules of blackjack, how basic strategy reduces the house edge, and why it never removes it.',
   E'Blackjack is played against the dealer. Cards 2–10 count at face value, picture cards count 10, and aces count 1 or 11.\n\nBasic strategy is a chart of mathematically best decisions. It lowers the house edge but the casino keeps an advantage over time.\n\nTreat any casino game as paid entertainment, with a fixed budget and time limit.',
   'casino_guide', 'table-games', null, null, 'published', now() - interval '4 days', false),
  ('setting-deposit-and-time-limits',
   'Setting deposit and time limits that work',
   'Practical steps to keep gambling in check, plus where to find free, confidential help in South Africa.',
   E'Decide on a budget you can afford to lose before you start, and stop when it is gone.\n\nUse the deposit, loss and session-time limits that licensed operators provide.\n\nWarning signs include chasing losses, borrowing to gamble and hiding gambling from family.\n\nFree, confidential help is available 24/7 from the National Responsible Gambling Programme.',
   'responsible_gambling', 'safer-gambling', null, null, 'published', now() - interval '6 days', true),
  ('continental-cup-quarter-final-preview-draft',
   'Continental Champions Cup quarter-final preview (draft)',
   'Draft preview awaiting confirmed line-ups for the quarter-final first leg.',
   E'Draft — waiting for confirmed team news.',
   'preview', 'match-previews', 'football', 'continental-champions-cup', 'draft', null, false),
  ('weekend-football-tips-scheduled',
   'Weekend football tips: scheduled for Friday',
   'Our Friday round-up of Highveld Premier League angles, scheduled to publish ahead of the weekend.',
   E'Scheduled content — not yet visible to the public.',
   'tip', 'betting-tips', 'football', 'highveld-premier-league', 'published', now() + interval '3 days', false)
) as a(slug, title, excerpt, body, content_type, category, sport, league, status, published_at, featured)
join public.categories c on c.slug = a.category
left join public.sports s on s.slug = a.sport
left join public.leagues l on l.slug = a.league;

-- Seed inserts are not user actions; keep the audit log clean.
truncate public.audit_logs;
