import { test, expect } from '@playwright/test'

test.describe('Human vs Agentic simulator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/human-vs-agentic')
  })

  test('page loads with three pipeline views', async ({ page }) => {
    await expect(page.getByTestId('human-vs-agentic-page')).toBeVisible()
    await expect(page.getByTestId('triple-comparison')).toBeVisible()

    const pipelines = page
      .getByTestId('triple-comparison')
      .locator('[data-testid^="pipeline-"]')
    await expect(pipelines).toHaveCount(3)
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
    const humanWip = await cells.nth(1).textContent()
    expect(parseInt(humanWip)).toBeGreaterThan(0)
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

  test('simulator-specific sliders are visible', async ({ page }) => {
    await expect(page.getByTestId('human-batch-size-input')).toBeVisible()
    await expect(page.getByTestId('agent-speed-input')).toBeVisible()
    await expect(page.getByTestId('reviewer-count-input')).toBeVisible()
    await expect(page.getByTestId('auto-review-time-input')).toBeVisible()
    await expect(page.getByTestId('review-wait-input')).toBeVisible()
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
    await expect(page.getByTestId('callout-batch-size-effect')).toBeVisible()
    await expect(page.getByTestId('callout-review-bottleneck')).toBeVisible()
  })
})
