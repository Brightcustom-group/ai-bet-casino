import { expect, test } from '@playwright/test'

test('homepage shows featured content and responsible-gambling notices', async ({ page }, info) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Featured' })).toBeVisible()
  await expect(page.getByRole('note', { name: 'Responsible gambling' })).toContainText('18+')
  await expect(page.getByRole('complementary', { name: 'Responsible gambling notice' })).toBeVisible()
  // No horizontal overflow: the document must fit the device viewport (mobile browsers
  // otherwise zoom out, which also grows window.innerWidth, so compare to the device).
  const docWidth = await page.evaluate(() => document.documentElement.scrollWidth)
  expect(docWidth).toBeLessThanOrEqual(page.viewportSize()!.width)
  await page.screenshot({ path: `test-results/screens/home-${info.project.name}.png`, fullPage: true })
})

test('visitors can filter and search content', async ({ page }) => {
  await page.goto('/sports')
  await page.getByLabel('Sport').selectOption('cricket')
  await page.getByRole('button', { name: 'Apply' }).click()
  await expect(page).toHaveURL(/sport=cricket/)
  await expect(page.getByRole('article')).toHaveCount(1)

  await page.goto('/search?q=zzzz-no-match')
  await expect(page.getByRole('status').filter({ hasText: 'No articles match' })).toBeVisible()
})

test('article page has disclaimer and SAST time; drafts are 404', async ({ page }, info) => {
  await page.goto('/articles/highveld-rovers-v-cape-coast-united-preview')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Highveld Rovers')
  await expect(page.getByText(/SAST/).first()).toBeVisible()
  await expect(page.getByRole('complementary', { name: 'Responsible gambling notice' })).toBeVisible()
  await page.screenshot({ path: `test-results/screens/article-${info.project.name}.png`, fullPage: true })

  const draft = await page.goto('/articles/continental-cup-quarter-final-preview-draft')
  expect(draft?.status()).toBe(404)
})
