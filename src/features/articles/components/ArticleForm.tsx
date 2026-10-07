'use client'

import { startTransition, useActionState, useEffect, useRef, useState, type FormEvent } from 'react'
import type { Taxonomy } from '@/features/taxonomy/queries'
import type { EditableArticle } from '../editor-queries'
import { isoToSastLocalInput } from '@/lib/format'
import { saveArticle, type ArticleFormState } from '../actions'
import { contentTypeLabels, contentTypeSection, displayStatus, type ContentType } from '../types'
import { slugify } from '../validation'

type Props = { taxonomy: Taxonomy; article: EditableArticle | null }

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? <p className="field-error" id={id}>{message}</p> : null
}

export function ArticleForm({ taxonomy, article }: Props) {
  const [state, formAction, pending] = useActionState<ArticleFormState, FormData>(
    saveArticle.bind(null, article?.id ?? null),
    {},
  )
  const errors = state.fieldErrors ?? {}

  const [title, setTitle] = useState(article?.title ?? '')
  const [slug, setSlug] = useState(article?.slug ?? '')
  const [slugEdited, setSlugEdited] = useState(Boolean(article))
  const [contentType, setContentType] = useState<ContentType>(article?.content_type ?? 'preview')
  const [sportId, setSportId] = useState(article?.sport_id ? String(article.sport_id) : '')

  // Submit manually so React does not reset the form after an error (which would
  // clear selects and lose the editor's work). The clicked button supplies `intent`.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const submitter = (event.nativeEvent as SubmitEvent).submitter
    const formData = new FormData(event.currentTarget, submitter)
    startTransition(() => formAction(formData))
  }

  const summaryRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (state.error) summaryRef.current?.focus()
  }, [state])

  const section = contentTypeSection[contentType]
  const categories = taxonomy.categories.filter((c) => c.section === section)
  const leagues = taxonomy.leagues.filter((l) => String(l.sport_id) === sportId)
  const status = article ? displayStatus(article.status, article.published_at) : 'draft'
  const describe = (name: string, hint?: string) =>
    [hint, errors[name] ? `${name}-error` : undefined].filter(Boolean).join(' ') || undefined

  return (
    <form onSubmit={handleSubmit} className="panel form-grid" noValidate>
      <div ref={summaryRef} tabIndex={-1}>
        {state.error && (
          <div className="alert alert-error" role="alert">
            {state.error}
            {Object.keys(errors).length > 0 && (
              <ul>
                {Object.entries(errors).map(([field, message]) => (
                  <li key={field}><a href={`#${field}`}>{message}</a></li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <p>
        Current status: <span className={`status status-${status}`}>{status}</span>
      </p>

      <div className="field">
        <label htmlFor="title">Title</label>
        <input
          id="title" name="title" type="text" required maxLength={160} value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            if (!slugEdited) setSlug(slugify(e.target.value))
          }}
          aria-invalid={errors.title ? true : undefined} aria-describedby={describe('title')}
        />
        <FieldError id="title-error" message={errors.title} />
      </div>

      <div className="field">
        <label htmlFor="slug">URL slug</label>
        <input
          id="slug" name="slug" type="text" required maxLength={120} value={slug}
          onChange={(e) => {
            setSlug(e.target.value)
            setSlugEdited(true)
          }}
          aria-invalid={errors.slug ? true : undefined} aria-describedby={describe('slug', 'slug-hint')}
        />
        <p className="hint" id="slug-hint">aibetcasino.com/articles/{slug || '…'}</p>
        <FieldError id="slug-error" message={errors.slug} />
      </div>

      <div className="form-row">
        <div className="field">
          <label htmlFor="content_type">Content type</label>
          <select
            id="content_type" name="content_type" value={contentType}
            onChange={(e) => setContentType(e.target.value as ContentType)}
            aria-invalid={errors.content_type ? true : undefined} aria-describedby={describe('content_type')}
          >
            {Object.entries(contentTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <FieldError id="content_type-error" message={errors.content_type} />
        </div>
        <div className="field">
          <label htmlFor="category_id">Category</label>
          <select
            key={section} id="category_id" name="category_id"
            defaultValue={article?.category_id ? String(article.category_id) : ''}
            aria-invalid={errors.category_id ? true : undefined} aria-describedby={describe('category_id')}
          >
            <option value="">Choose…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <FieldError id="category_id-error" message={errors.category_id} />
        </div>
      </div>

      {section === 'sports' && (
        <div className="form-row">
          <div className="field">
            <label htmlFor="sport_id">Sport (optional)</label>
            <select
              id="sport_id" name="sport_id" value={sportId} onChange={(e) => setSportId(e.target.value)}
              aria-invalid={errors.sport_id ? true : undefined} aria-describedby={describe('sport_id')}
            >
              <option value="">None</option>
              {taxonomy.sports.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <FieldError id="sport_id-error" message={errors.sport_id} />
          </div>
          <div className="field">
            <label htmlFor="league_id">League (optional)</label>
            <select
              key={sportId} id="league_id" name="league_id"
              defaultValue={article?.league_id ? String(article.league_id) : ''}
              disabled={!sportId}
              aria-invalid={errors.league_id ? true : undefined} aria-describedby={describe('league_id')}
            >
              <option value="">{sportId ? 'None' : 'Choose a sport first'}</option>
              {leagues.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
            <FieldError id="league_id-error" message={errors.league_id} />
          </div>
        </div>
      )}

      <div className="field">
        <label htmlFor="excerpt">Summary</label>
        <textarea
          id="excerpt" name="excerpt" required maxLength={300} style={{ minHeight: 90 }}
          defaultValue={article?.excerpt ?? ''}
          aria-invalid={errors.excerpt ? true : undefined} aria-describedby={describe('excerpt', 'excerpt-hint')}
        />
        <p className="hint" id="excerpt-hint">20–300 characters. Used on cards and as the search-result description.</p>
        <FieldError id="excerpt-error" message={errors.excerpt} />
      </div>

      <div className="field">
        <label htmlFor="body">Body</label>
        <textarea
          id="body" name="body" required
          defaultValue={article?.body ?? ''}
          aria-invalid={errors.body ? true : undefined} aria-describedby={describe('body', 'body-hint')}
        />
        <p className="hint" id="body-hint">
          Plain text; leave a blank line between paragraphs. Use decimal odds and SAST times. Never promise wins.
        </p>
        <FieldError id="body-error" message={errors.body} />
      </div>

      <div className="form-row">
        <div className="field">
          <label htmlFor="publish_at">Publish at (SAST, optional)</label>
          <input
            id="publish_at" name="publish_at" type="datetime-local"
            defaultValue={article?.published_at ? isoToSastLocalInput(article.published_at) : ''}
            aria-invalid={errors.publish_at ? true : undefined} aria-describedby={describe('publish_at', 'publish_at-hint')}
          />
          <p className="hint" id="publish_at-hint">Empty = publish now. A future time schedules the article.</p>
          <FieldError id="publish_at-error" message={errors.publish_at} />
        </div>
        <div className="field">
          <span className="checkbox">
            <input
              id="is_featured" name="is_featured" type="checkbox"
              defaultChecked={Boolean(article?.is_featured)}
            />
            <label htmlFor="is_featured">Feature on the homepage</label>
          </span>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" name="intent" value="publish" className="button" disabled={pending}>
          {article?.status === 'published' ? 'Update published article' : 'Publish'}
        </button>
        <button type="submit" name="intent" value="draft" className="button button-secondary" disabled={pending}>
          {article?.status === 'published' ? 'Unpublish to draft' : 'Save draft'}
        </button>
        {article && article.status !== 'archived' && (
          <button type="submit" name="intent" value="archive" className="button button-secondary" disabled={pending}>
            Archive
          </button>
        )}
        <span role="status" aria-live="polite">{pending ? 'Saving…' : ''}</span>
      </div>
    </form>
  )
}
