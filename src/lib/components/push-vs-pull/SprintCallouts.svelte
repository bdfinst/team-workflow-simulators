<script>
  let { pushMetrics, pullMetrics, isRunning, isComplete } = $props()

  let showReviewBottleneck = $derived(
    isRunning && pushMetrics && pushMetrics.reviewQueueDepth > 3,
  )

  let showSharedGoals = $derived(
    isRunning &&
      pushMetrics &&
      pullMetrics &&
      pullMetrics.itemsCompleted > pushMetrics.itemsCompleted,
  )

  let showPartiallyDoneWaste = $derived(
    isComplete &&
      pushMetrics &&
      pullMetrics &&
      pushMetrics.itemsInProgress > pullMetrics.itemsInProgress,
  )
</script>

<div aria-live="polite" data-testid="educational-callouts">
  <div class="mb-2 flex items-center gap-2">
    <h3 class="text-xs font-semibold uppercase tracking-wider text-surface-400">
      Concepts
    </h3>
    <div class="h-px flex-1 bg-surface-600"></div>
  </div>

  <div class="space-y-2">
    <div
      class="rounded border border-accent-blue/20 bg-accent-blue/5 px-3 py-2"
      data-testid="callout-push-vs-pull"
    >
      <h4 class="text-xs font-semibold text-accent-blue">
        Push vs Pull Systems
      </h4>
      <p class="mt-0.5 text-[11px] leading-snug text-surface-300">
        Push assigns work to individuals upfront; pull uses a shared queue where
        the next available person takes the highest-priority item. Task size and
        review habits differ between models — push favors large batches with
        infrequent reviews, while pull favors small tasks with immediate review.
      </p>
    </div>

    {#if showReviewBottleneck}
      <div
        class="rounded border border-accent-amber/20 bg-accent-amber/5 px-3 py-2"
        data-testid="callout-review-bottleneck"
      >
        <h4 class="text-xs font-semibold text-accent-amber">
          Review as Bottleneck
        </h4>
        <p class="mt-0.5 text-[11px] leading-snug text-surface-300">
          Infrequent review checks cause items to pile up in the review queue.
          Larger tasks make reviews harder and slower, compounding the problem.
          The push team's review queue is growing while items wait for someone
          to notice them.
        </p>
      </div>
    {/if}

    {#if showSharedGoals}
      <div
        class="rounded border border-accent-green/20 bg-accent-green/5 px-3 py-2"
        data-testid="callout-shared-goals"
      >
        <h4 class="text-xs font-semibold text-accent-green">
          Shared Goals vs Individual Goals
        </h4>
        <p class="mt-0.5 text-[11px] leading-snug text-surface-300">
          Shared goals motivate the team to prioritize reviews — finishing
          someone else's item is as valuable as starting your own. Small tasks
          enable fast, contextual reviews because the reviewer understands the
          change.
        </p>
      </div>
    {/if}

    {#if showPartiallyDoneWaste}
      <div
        class="rounded border border-accent-red/20 bg-accent-red/5 px-3 py-2"
        data-testid="callout-partially-done-waste"
      >
        <h4 class="text-xs font-semibold text-accent-red">
          Partially Done = Waste
        </h4>
        <p class="mt-0.5 text-[11px] leading-snug text-surface-300">
          Items in progress at sprint end represent invested effort with no
          value delivered. The push team has more partially done work because
          large tasks take longer to complete and reviews pile up unfinished.
        </p>
      </div>
    {/if}
  </div>
</div>
