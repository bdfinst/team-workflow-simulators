<script>
  let { pairMetrics, syncMetrics, asyncMetrics, isRunning } = $props()

  let showRework = $derived(
    isRunning &&
      (pairMetrics.itemsCompleted > 0 ||
        syncMetrics.itemsCompleted > 0 ||
        asyncMetrics.itemsCompleted > 0),
  )

  let showContextSwitch = $derived(
    isRunning &&
      syncMetrics.avgLeadTime > 0 &&
      syncMetrics.avgLeadTime > pairMetrics.avgLeadTime,
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
      data-testid="callout-handoff-waste"
    >
      <h4 class="text-xs font-semibold text-accent-blue">Handoff Waste</h4>
      <p class="mt-0.5 text-[11px] leading-snug text-surface-300">
        Every handoff between people adds wait time. Pair programming eliminates
        the review handoff entirely.
      </p>
    </div>

    <div
      class="rounded border border-accent-purple/20 bg-accent-purple/5 px-3 py-2"
      data-testid="callout-queue-theory"
    >
      <h4 class="text-xs font-semibold text-accent-purple">Queue Theory</h4>
      <p class="mt-0.5 text-[11px] leading-snug text-surface-300">
        When reviewers are scarce, review queues grow exponentially. A single
        reviewer creates a bottleneck for the whole team.
      </p>
    </div>

    {#if showRework}
      <div
        class="rounded border border-accent-amber/20 bg-accent-amber/5 px-3 py-2"
        data-testid="callout-rework-loops"
      >
        <h4 class="text-xs font-semibold text-accent-amber">Rework Loops</h4>
        <p class="mt-0.5 text-[11px] leading-snug text-surface-300">
          Review feedback sends items back for rework. In async review, long
          wait times mean each rework cycle is especially costly.
        </p>
      </div>
    {/if}

    {#if showContextSwitch}
      <div
        class="rounded border border-accent-red/20 bg-accent-red/5 px-3 py-2"
        data-testid="callout-context-switching"
      >
        <h4 class="text-xs font-semibold text-accent-red">Context Switching</h4>
        <p class="mt-0.5 text-[11px] leading-snug text-surface-300">
          Synchronous reviews interrupt developers mid-task. The context switch
          penalty slows down everyone's development work.
        </p>
      </div>
    {/if}
  </div>
</div>
