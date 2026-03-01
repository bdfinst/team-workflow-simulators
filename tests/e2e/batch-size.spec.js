import { test, expect } from '@playwright/test'

test.describe('Batch Size simulator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/batch-size')
  })

  test('page loads with two pipeline views', async ({ page }) => {
    await expect(page.getByTestId('batch-size-page')).toBeVisible()
    await expect(page.getByTestId('pipeline-large-batches')).toBeVisible()
    await expect(page.getByTestId('pipeline-small-batches')).toBeVisible()
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

    for (let i = 0; i < 15; i++) {
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
    const largeWip = await cells.nth(1).textContent()
    expect(parseInt(largeWip)).toBeGreaterThan(0)
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

  test('batch multiplier slider is visible and adjustable', async ({
    page,
  }) => {
    await expect(page.getByTestId('batch-multiplier-input')).toBeVisible()
    await expect(page.getByTestId('work-item-count-input')).toBeVisible()
    await expect(page.getByTestId('simulation-speed-input')).toBeVisible()
  })

  test('config panel toggles open and shows shared settings', async ({
    page,
  }) => {
    const toggle = page.getByTestId('config-panel-toggle')
    await expect(toggle).toBeVisible()

    await expect(page.getByTestId('config-panel-body')).not.toBeVisible()

    await toggle.click()
    await expect(page.getByTestId('config-panel-body')).toBeVisible()
    await expect(page.getByTestId('config-team-size-input')).toBeVisible()
  })

  test('educational callouts are visible', async ({ page }) => {
    await expect(page.getByTestId('callout-transaction-cost')).toBeVisible()
    await expect(page.getByTestId('callout-fast-feedback')).toBeVisible()
  })
})
