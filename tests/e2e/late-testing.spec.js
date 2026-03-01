import { test, expect } from '@playwright/test'

test.describe('Late Testing simulator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/late-testing')
  })

  test('page loads with two pipeline views', async ({ page }) => {
    await expect(page.getByTestId('late-testing-page')).toBeVisible()
    await expect(page.getByTestId('pipeline-late-testing')).toBeVisible()
    await expect(page.getByTestId('pipeline-shift-left-testing')).toBeVisible()
  })

  test('step button advances pipeline state', async ({ page }) => {
    const stepButton = page.getByTestId('step-button')

    await expect(page.getByTestId('active-item')).toHaveCount(0)

    await stepButton.click()

    const totalItems =
      (await page.getByTestId('queue-item').count()) +
      (await page.getByTestId('active-item').count())
    expect(totalItems).toBeGreaterThan(0)
  })

  test('completed items appear after enough steps', async ({ page }) => {
    const stepButton = page.getByTestId('step-button')

    for (let i = 0; i < 20; i++) {
      await stepButton.click()
    }

    const completedItems = page.getByTestId('completed-item')
    await expect(completedItems.first()).toBeVisible()
  })

  test('metrics update after stepping', async ({ page }) => {
    const stepButton = page.getByTestId('step-button')

    const wipRow = page.getByTestId('metric-wip-count')
    await expect(wipRow).toBeVisible()

    await stepButton.click()
    await stepButton.click()

    const cells = wipRow.locator('td')
    const lateWip = await cells.nth(1).textContent()
    expect(parseInt(lateWip)).toBeGreaterThan(0)
  })

  test('reset clears all pipeline items', async ({ page }) => {
    const stepButton = page.getByTestId('step-button')
    const resetButton = page.getByTestId('reset-button')

    for (let i = 0; i < 5; i++) {
      await stepButton.click()
    }

    const itemsBefore =
      (await page.getByTestId('active-item').count()) +
      (await page.getByTestId('queue-item').count())
    expect(itemsBefore).toBeGreaterThan(0)

    await resetButton.click()

    await expect(page.getByTestId('active-item')).toHaveCount(0)
    await expect(page.getByTestId('queue-item')).toHaveCount(0)
    await expect(page.getByTestId('completed-item')).toHaveCount(0)
  })

  test('parameter sliders are visible', async ({ page }) => {
    await expect(page.getByTestId('defect-rate-input')).toBeVisible()
    await expect(page.getByTestId('feedback-delay-input')).toBeVisible()
    await expect(page.getByTestId('work-item-count-input')).toBeVisible()
    await expect(page.getByTestId('simulation-speed-input')).toBeVisible()
  })

  test('config panel toggles open', async ({ page }) => {
    const toggle = page.getByTestId('config-panel-toggle')
    await expect(toggle).toBeVisible()

    await expect(page.getByTestId('config-panel-body')).not.toBeVisible()

    await toggle.click()
    await expect(page.getByTestId('config-panel-body')).toBeVisible()
  })

  test('educational callouts are visible', async ({ page }) => {
    await expect(page.getByTestId('callout-late-feedback')).toBeVisible()
    await expect(page.getByTestId('callout-shift-left')).toBeVisible()
  })
})
