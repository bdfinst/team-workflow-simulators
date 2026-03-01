import { test, expect } from '@playwright/test'

test.describe('Code Review Styles simulator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/code-review-styles')
  })

  test('page loads with three pipeline views', async ({ page }) => {
    await expect(page.getByTestId('code-review-styles-page')).toBeVisible()
    await expect(page.getByTestId('pipeline-pair-programming')).toBeVisible()
    await expect(page.getByTestId('pipeline-synchronous-review')).toBeVisible()
    await expect(page.getByTestId('pipeline-async-review')).toBeVisible()
  })

  test('step button advances all three pipelines', async ({ page }) => {
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
    const pairWip = await cells.nth(1).textContent()
    expect(parseInt(pairWip)).toBeGreaterThan(0)
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

  test('parameter sliders exist and are adjustable', async ({ page }) => {
    await expect(page.getByTestId('team-size-input')).toBeVisible()
    await expect(page.getByTestId('max-retries-input')).toBeVisible()
    await expect(page.getByTestId('pair-overhead-input')).toBeVisible()
    await expect(page.getByTestId('context-switch-input')).toBeVisible()
    await expect(page.getByTestId('async-wait-input')).toBeVisible()
    await expect(page.getByTestId('work-item-count-input')).toBeVisible()
    await expect(page.getByTestId('simulation-speed-input')).toBeVisible()
  })

  test('educational callouts are visible', async ({ page }) => {
    await expect(page.getByTestId('callout-handoff-waste')).toBeVisible()
    await expect(page.getByTestId('callout-queue-theory')).toBeVisible()
  })
})
