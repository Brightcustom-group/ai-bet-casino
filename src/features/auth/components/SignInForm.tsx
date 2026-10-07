'use client'

import { useActionState } from 'react'
import { signIn, type SignInState } from '../actions'

export function SignInForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<SignInState, FormData>(signIn, {})
  return (
    <form action={action} className="form-grid" noValidate>
      {state.error && (
        <p className="alert alert-error" role="alert" id="signin-error">
          {state.error}
        </p>
      )}
      <input type="hidden" name="next" value={next} />
      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          defaultValue={state.email}
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? 'signin-error' : undefined}
        />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? 'signin-error' : undefined}
        />
      </div>
      <button type="submit" className="button" disabled={pending}>
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
