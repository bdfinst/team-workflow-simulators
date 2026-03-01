<script>
  let { unboundedMetrics, wipLimitedMetrics, isComplete } = $props()

  const better = (a, b, lowerIsBetter = true) => {
    if (a === b) return 'neutral'
    if (lowerIsBetter) return a < b ? 'better' : 'worse'
    return a > b ? 'better' : 'worse'
  }

  const statusColor = (status) => {
    if (!isComplete) return 'text-surface-100'
    if (status === 'better') return 'text-accent-green'
    if (status === 'worse') return 'text-accent-red'
    return 'text-surface-100'
  }

  const statusLabel = (status) => {
    if (status === 'better') return '(better)'
    if (status === 'worse') return '(worse)'
    return ''
  }
</script>

<div data-testid="metrics-dashboard">
  <div class="mb-2 flex items-center gap-2">
    <h3 class="text-xs font-semibold uppercase tracking-wider text-surface-400">
      Metrics
    </h3>
    <div class="h-px flex-1 bg-surface-600"></div>
  </div>

  <div class="overflow-x-auto">
    <table class="w-full text-xs">
      <caption class="sr-only"
        >Comparison of metrics between unbounded and WIP-limited pipelines</caption
      >
      <thead>
        <tr class="text-surface-400">
          <th class="pb-1 pr-3 text-left font-medium">Metric</th>
          <th class="pb-1 pr-3 text-right font-medium">No Limit</th>
          <th class="pb-1 text-right font-medium">WIP-Limited</th>
        </tr>
      </thead>
      <tbody class="font-mono">
        <tr class="border-t border-surface-700" data-testid="metric-wip-count">
          <td class="py-1 pr-3 font-sans font-medium text-surface-200"
            >WIP Count</td
          >
          <td
            class="py-1 pr-3 text-right {statusColor(
              better(unboundedMetrics.wipCount, wipLimitedMetrics.wipCount),
            )}"
          >
            {unboundedMetrics.wipCount}
            <span class="sr-only"
              >{statusLabel(
                better(unboundedMetrics.wipCount, wipLimitedMetrics.wipCount),
              )}</span
            >
          </td>
          <td
            class="py-1 text-right {statusColor(
              better(wipLimitedMetrics.wipCount, unboundedMetrics.wipCount),
            )}"
          >
            {wipLimitedMetrics.wipCount}
            <span class="sr-only"
              >{statusLabel(
                better(wipLimitedMetrics.wipCount, unboundedMetrics.wipCount),
              )}</span
            >
          </td>
        </tr>
        <tr
          class="border-t border-surface-700"
          data-testid="metric-avg-lead-time"
        >
          <td class="py-1 pr-3 font-sans font-medium text-surface-200"
            >Avg Lead Time</td
          >
          <td
            class="py-1 pr-3 text-right {statusColor(
              better(
                unboundedMetrics.avgLeadTime,
                wipLimitedMetrics.avgLeadTime,
              ),
            )}"
          >
            {unboundedMetrics.avgLeadTime.toFixed(1)}
          </td>
          <td
            class="py-1 text-right {statusColor(
              better(
                wipLimitedMetrics.avgLeadTime,
                unboundedMetrics.avgLeadTime,
              ),
            )}"
          >
            {wipLimitedMetrics.avgLeadTime.toFixed(1)}
          </td>
        </tr>
        <tr class="border-t border-surface-700" data-testid="metric-throughput">
          <td class="py-1 pr-3 font-sans font-medium text-surface-200"
            >Throughput</td
          >
          <td
            class="py-1 pr-3 text-right {statusColor(
              better(
                unboundedMetrics.throughput,
                wipLimitedMetrics.throughput,
                false,
              ),
            )}"
          >
            {unboundedMetrics.throughput.toFixed(3)}
          </td>
          <td
            class="py-1 text-right {statusColor(
              better(
                wipLimitedMetrics.throughput,
                unboundedMetrics.throughput,
                false,
              ),
            )}"
          >
            {wipLimitedMetrics.throughput.toFixed(3)}
          </td>
        </tr>
        <tr
          class="border-t border-surface-700"
          data-testid="metric-flow-efficiency"
        >
          <td class="py-1 pr-3 font-sans font-medium text-surface-200"
            >Flow Efficiency</td
          >
          <td
            class="py-1 pr-3 text-right {statusColor(
              better(
                unboundedMetrics.flowEfficiency,
                wipLimitedMetrics.flowEfficiency,
                false,
              ),
            )}"
          >
            {(unboundedMetrics.flowEfficiency * 100).toFixed(0)}%
          </td>
          <td
            class="py-1 text-right {statusColor(
              better(
                wipLimitedMetrics.flowEfficiency,
                unboundedMetrics.flowEfficiency,
                false,
              ),
            )}"
          >
            {(wipLimitedMetrics.flowEfficiency * 100).toFixed(0)}%
          </td>
        </tr>
        <tr
          class="border-t border-surface-700"
          data-testid="metric-items-completed"
        >
          <td class="py-1 pr-3 font-sans font-medium text-surface-200"
            >Completed</td
          >
          <td class="py-1 pr-3 text-right text-surface-100">
            {unboundedMetrics.itemsCompleted}
          </td>
          <td class="py-1 text-right text-surface-100">
            {wipLimitedMetrics.itemsCompleted}
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Queue depths -->
  <div class="mt-3 border-t border-surface-700 pt-2" data-testid="queue-depths">
    <h4
      class="mb-1 text-[10px] font-medium uppercase tracking-wider text-surface-400"
    >
      Queue Depths
    </h4>
    <div class="grid grid-cols-2 gap-4 text-xs">
      <div>
        <span class="text-[10px] text-surface-400">No Limit</span>
        <div class="mt-0.5 space-y-0.5">
          {#each unboundedMetrics.queueDepths as q (q.name)}
            <div class="flex items-center justify-between">
              <span class="text-surface-300">{q.name}</span>
              <span class="font-mono text-surface-100">{q.depth}</span>
            </div>
          {/each}
        </div>
      </div>
      <div>
        <span class="text-[10px] text-surface-400">WIP-Limited</span>
        <div class="mt-0.5 space-y-0.5">
          {#each wipLimitedMetrics.queueDepths as q (q.name)}
            <div class="flex items-center justify-between">
              <span class="text-surface-300">{q.name}</span>
              <span class="font-mono text-surface-100">{q.depth}</span>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>
