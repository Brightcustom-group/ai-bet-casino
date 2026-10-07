// Prints dev-only HS256 API keys (anon/service_role) for the local JWT secret.
import { createHmac } from 'node:crypto'

const secret = process.env.JWT_SECRET
if (!secret) throw new Error('JWT_SECRET is required')
const b64 = (v) => Buffer.from(JSON.stringify(v)).toString('base64url')
const sign = (role) => {
  const body = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ iss: 'supabase-demo', role, exp: 1983812996 })}`
  return `${body}.${createHmac('sha256', secret).update(body).digest('base64url')}`
}
console.log(`ANON_KEY=${sign('anon')}`)
console.log(`SERVICE_ROLE_KEY=${sign('service_role')}`)
