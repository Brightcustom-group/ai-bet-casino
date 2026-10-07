import { expect, test, type Page } from '@playwright/test'

const PASSWORD = 'dev-password-123'

async function signIn(page: Page, email: string) {
  await page.goto('/editor')
  await expect(page).toHaveURL(/\/editor\/sign-in/)
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(PASSWORD)
  await page.getByRole('button', { name: 'Sign in' }).click()
}

test('wrong password and non-editor accounts are refused', async ({ page }) => {
  await page.goto('/editor/sign-in')
  await page.getByLabel('Email').fill('editor@aibetcasino.test')
  await page.getByLabel('Password').fill('wrong-password')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByRole('alert').filter({ hasText: 'Email or password is incorrect.' })).toBeVisible()

  await signIn(page, 'reader@aibetcasino.test')
  await expect(page.getByRole('alert').filter({ hasText: 'This account does not have editor access.' })).toBeVisible()
  await page.goto('/editor/articles/new')
  await expect(page).toHaveURL(/\/editor\/sign-in/)
})

test('editor creates, validates, publishes and finds an article', async ({ page }, info) => {
  const unique = `${info.project.name}-${Date.now()}`
  const title = `E2E derby preview ${unique}`

  await signIn(page, 'editor@aibetcasino.test')
  await expect(page.getByRole('heading', { name: 'Content' })).toBeVisible()
  await page.getByRole('link', { name: 'New article' }).first().click()

  await page.getByLabel('Title').fill(title)
  await expect(page.getByLabel('URL slug')).toHaveValue(`e2e-derby-preview-${unique}`)
  await page.getByLabel('Category').selectOption({ label: 'Match previews' })
  await page.getByLabel('Sport (optional)').selectOption({ label: 'Football' })
  await page.getByLabel('League (optional)').selectOption({ label: 'Highveld Premier League' })
  await page.getByLabel('Summary').fill('Synthetic end-to-end preview with form and team news.')
  await page.getByLabel('Body').fill('Kick-off is 15:30 SAST. This one is a guaranteed win.')
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width)
  await page.screenshot({ path: `test-results/screens/editor-form-${info.project.name}.png`, fullPage: true })

  // Compliance guard: outcome promises are rejected and input is kept.
  await page.getByRole('button', { name: 'Publish' }).click()
  await expect(page.getByRole('alert').filter({ hasText: 'Please fix the highlighted fields' })).toBeVisible()
  await expect(page.getByLabel('Body')).toHaveAttribute('aria-invalid', 'true')
  await expect(page.getByLabel('Summary')).toHaveValue('Synthetic end-to-end preview with form and team news.')

  await page.getByLabel('Body').fill('Kick-off is 15:30 SAST.\n\nThe home win is priced at 2.10. No outcome is guaranteed.')
  await page.getByRole('button', { name: 'Publish' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Saved. Status: published' })).toBeVisible()

  // Visible on the public site after refresh, and searchable.
  await page.getByRole('link', { name: 'View live article' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title)
  await expect(page.getByText('By Thandi Editor')).toBeVisible()
  await page.goto(`/search?q=${encodeURIComponent(unique)}`)
  await expect(page.getByRole('link', { name: title })).toBeVisible()
})
