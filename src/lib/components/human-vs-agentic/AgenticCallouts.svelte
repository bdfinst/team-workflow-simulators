<script>
  let { agentManualMetrics, agentAutoMetrics, isRunning } = $props()

  let showAutomationAdvantage = $derived(
    isRunning &&
      agentAutoMetrics.avgLeadTime > 0 &&
      agentManualMetrics.avgLeadTime > 0 &&
      agentAutoMetrics.avgLeadTime < agentManualMetrics.avgLeadTime * 0.8,
  )

  let showQueueStarvation = $derived(
    isRunning &&
      agentManualMetrics.queueDepths.some(
        (q) => q.name === 'Code Review' && q.depth > 3,
      ),
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
      data-testid="callout-batch-size-effect"
    >
      <h4 class="text-xs font-semibold text-accent-blue">Batch Size Effect</h4>
      <p class="mt-0.5 text-[11px] leading-snug text-surface-300">
        Large batches block the pipeline at every step. Human development
        bundles work into big items, while agents produce small, continuously
        flowing pieces.
      </p>
    </div>

    <div
      class="rounded border border-accent-purple/20 bg-accent-purple/5 px-3 py-2"
      data-testid="callout-review-bottleneck"
    >
      <h4 class="text-xs font-semibold text-accent-purple">
        Review Bottleneck
      </h4>
      <p class="mt-0.5 text-[11px] leading-snug text-surface-300">
        Agent speed alone isn't enough. When a limited number of human reviewers
        must approve every change, the review step becomes the constraint that
        governs total throughput.
      </p>
    </div>

    {#if showAutomationAdvantage}
      <div
        class="rounded border border-accent-green/20 bg-accent-green/5 px-3 py-2"
        data-testid="callout-automation-advantage"
      >
        <h4 class="text-xs font-semibold text-accent-green">
          Automation Advantage
        </h4>
        <p class="mt-0.5 text-[11px] leading-snug text-surface-300">
          Automated review eliminates the human bottleneck, allowing
          agent-produced items to flow freely through the pipeline. This is the
          key that unlocks agentic development.
        </p>
      </div>
    {/if}

    {#if showQueueStarvation}
      <div
        class="rounded border border-accent-amber/20 bg-accent-amber/5 px-3 py-2"
        data-testid="callout-queue-starvation"
      >
        <h4 class="text-xs font-semibold text-accent-amber">
          Queue Starvation
        </h4>
        <p class="mt-0.5 text-[11px] leading-snug text-surface-300">
          Items pile up waiting for manual review while downstream steps sit
          idle. The review queue grows because agents produce faster than
          reviewers can approve.
        </p>
      </div>
    {/if}
  </div>
</div>
