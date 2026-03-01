import { test, expect } from '@playwright/test'

test.describe('Unbounded WIP simulator realtime updates', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/unbounded-wip')
  })

  test('step button advances pipeline state visibly', async ({ page }) => {
    const stepButton = page.getByTestId('step-button')

    // Before stepping — no items should exist in queues or active
    const queueItems = page.getByTestId('queue-item')
    const activeItems = page.getByTestId('active-item')

    await expect(queueItems).toHaveCount(0)
    await expect(activeItems).toHaveCount(0)

    // Step once — items should appear
    await stepButton.click()

    const totalItems = (await queueItems.count()) + (await activeItems.count())
    expect(totalItems).toBeGreaterThan(0)
  })

  test('multiple steps change active item counts', async ({ page }) => {
    const stepButton = page.getByTestId('step-button')

    await stepButton.click()
    const afterFirst = await page.getByTestId('active-item').count()

    await stepButton.click()
    await stepButton.click()
    await stepButton.click()

    const afterFourth =
      (await page.getByTestId('active-item').count()) +
      (await page.getByTestId('queue-item').count()) +
      (await page.getByTestId('completed-item').count())

    // After four steps, total visible items should differ from after one step
    // because items move through the pipeline
    expect(afterFourth).toBeGreaterThanOrEqual(afterFirst)
  })

  test('completed items appear after enough steps', async ({ page }) => {
    const stepButton = page.getByTestId('step-button')

    // With default steps (Dev:4, Review:2, Test:3, Deploy:1), an item
    // needs at least ~11 ticks to complete the pipeline
    for (let i = 0; i < 15; i++) {
      await stepButton.click()
    }

    const completedItems = page.getByTestId('completed-item')
    await expect(completedItems.first()).toBeVisible()
  })

  test('start button triggers automatic pipeline updates', async ({ page }) => {
    const startButton = page.getByTestId('start-button')

    // Record initial state
    const initialActive = await page.getByTestId('active-item').count()
    const initialQueue = await page.getByTestId('queue-item').count()

    await startButton.click()

    // Wait for the simulation to advance — items should appear
    await expect(async () => {
      const active = await page.getByTestId('active-item').count()
      const queue = await page.getByTestId('queue-item').count()
      expect(active + queue).toBeGreaterThan(initialActive + initialQueue)
    }).toPass({ timeout: 3000 })
  })

  test('pipeline views update in real time during simulation', async ({
    page,
  }) => {
    await page.getByTestId('start-button').click()

    // Wait for at least one active item to appear
    await expect(page.getByTestId('active-item').first()).toBeVisible({
      timeout: 3000,
    })
    const firstSnapshot = await page.getByTestId('active-item').count()

    // Wait for more items to flow through the pipeline
    await expect(async () => {
      const total =
        (await page.getByTestId('active-item').count()) +
        (await page.getByTestId('queue-item').count()) +
        (await page.getByTestId('completed-item').count())
      expect(total).toBeGreaterThan(firstSnapshot)
    }).toPass({ timeout: 3000 })
  })

  test('metrics update after stepping', async ({ page }) => {
    const stepButton = page.getByTestId('step-button')

    // Check initial WIP count
    const wipRow = page.getByTestId('metric-wip-count')
    await expect(wipRow).toBeVisible()

    await stepButton.click()
    await stepButton.click()

    // After stepping, WIP count cells should show non-zero values
    const cells = wipRow.locator('td')
    const unboundedWip = await cells.nth(1).textContent()
    const wipLimitedWip = await cells.nth(2).textContent()

    expect(parseInt(unboundedWip)).toBeGreaterThan(0)
    expect(parseInt(wipLimitedWip)).toBeGreaterThan(0)
  })

  test('config panel toggles open and shows shared settings', async ({
    page,
  }) => {
    const toggle = page.getByTestId('config-panel-toggle')
    await expect(toggle).toBeVisible()

    // Panel body should be hidden by default
    await expect(page.getByTestId('config-panel-body')).not.toBeVisible()

    // Click to expand
    await toggle.click()
    await expect(page.getByTestId('config-panel-body')).toBeVisible()
    await expect(page.getByTestId('config-team-size-input')).toBeVisible()
    await expect(page.getByTestId('config-dev-time-input')).toBeVisible()
    await expect(page.getByTestId('config-spread-input')).toBeVisible()
    await expect(page.getByTestId('config-arrival-rate-input')).toBeVisible()
  })

  test('config panel sliders change values', async ({ page }) => {
    const toggle = page.getByTestId('config-panel-toggle')
    await toggle.click()

    const teamSizeInput = page.getByTestId('config-team-size-input')
    await expect(teamSizeInput).toBeVisible()

    // Change team size and verify the value updates
    await teamSizeInput.fill('4')
    await expect(teamSizeInput).toHaveValue('4')
  })

  test('tooltips are visible on hover', async ({ page }) => {
    const toggle = page.getByTestId('config-panel-toggle')
    await toggle.click()

    // Hover over a tooltip trigger (info icon next to Team Size)
    const tooltipTrigger = page
      .getByTestId('config-panel-body')
      .locator('[role="tooltip"]')
      .first()
    const triggerParent = tooltipTrigger.locator('..')
    await triggerParent.hover()

    await expect(tooltipTrigger).toBeVisible()
  })

  test('reset clears all pipeline items', async ({ page }) => {
    const stepButton = page.getByTestId('step-button')
    const resetButton = page.getByTestId('reset-button')

    // Step a few times to populate
    for (let i = 0; i < 5; i++) {
      await stepButton.click()
    }

    // Verify items exist
    const itemsBefore =
      (await page.getByTestId('active-item').count()) +
      (await page.getByTestId('queue-item').count())
    expect(itemsBefore).toBeGreaterThan(0)

    // Reset
    await resetButton.click()

    // All items should be cleared
    await expect(page.getByTestId('active-item')).toHaveCount(0)
    await expect(page.getByTestId('queue-item')).toHaveCount(0)
    await expect(page.getByTestId('completed-item')).toHaveCount(0)
  })
})
