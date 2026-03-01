<script>
  let { largeBatchMetrics, smallBatchMetrics, isRunning } = $props()

  let showQueueBuildup = $derived(
    isRunning && largeBatchMetrics.wipCount > smallBatchMetrics.wipCount + 2,
  )

  let showThroughputGap = $derived(
    isRunning &&
      smallBatchMetrics.throughput > 0 &&
      smallBatchMetrics.throughput > largeBatchMetrics.throughput,
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
      data-testid="callout-transaction-cost"
    >
      <h4 class="text-xs font-semibold text-accent-blue">Transaction Cost</h4>
      <p class="mt-0.5 text-[11px] leading-snug text-surface-300">
        Large items carry higher transaction costs at every handoff. Each step
        takes proportionally longer, blocking the entire pipeline.
      </p>
    </div>

    <div
      class="rounded border border-accent-purple/20 bg-accent-purple/5 px-3 py-2"
      data-testid="callout-fast-feedback"
    >
      <h4 class="text-xs font-semibold text-accent-purple">Fast Feedback</h4>
      <p class="mt-0.5 text-[11px] leading-snug text-surface-300">
        Small items complete sooner, giving faster feedback on quality and
        direction. Problems are caught before they compound.
      </p>
    </div>

    {#if showQueueBuildup}
      <div
        class="rounded border border-accent-amber/20 bg-accent-amber/5 px-3 py-2"
        data-testid="callout-queue-buildup"
      >
        <h4 class="text-xs font-semibold text-accent-amber">Queue Buildup</h4>
        <p class="mt-0.5 text-[11px] leading-snug text-surface-300">
          Large items block the pipeline longer, causing queues to grow.
          Downstream steps starve while upstream steps are overloaded.
        </p>
      </div>
    {/if}

    {#if showThroughputGap}
      <div
        class="rounded border border-accent-green/20 bg-accent-green/5 px-3 py-2"
        data-testid="callout-throughput-gap"
      >
        <h4 class="text-xs font-semibold text-accent-green">Throughput Gap</h4>
        <p class="mt-0.5 text-[11px] leading-snug text-surface-300">
          Small batches achieve higher throughput because items flow
          continuously through the pipeline without blocking.
        </p>
      </div>
    {/if}
  </div>
</div>
