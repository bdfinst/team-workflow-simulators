<script>
  let { pushMetrics, pullMetrics, isComplete } = $props()

  const cellColor = (value, pushVal, pullVal, lowerIsBetter = true) => {
    if (!isComplete) return 'text-surface-100'
    const best = lowerIsBetter
      ? Math.min(pushVal, pullVal)
      : Math.max(pushVal, pullVal)
    const worst = lowerIsBetter
      ? Math.max(pushVal, pullVal)
      : Math.min(pushVal, pullVal)
    if (value === best) return 'text-accent-green'
    if (value === worst) return 'text-accent-red'
    return 'text-surface-100'
  }
</script>

<div data-testid="metrics-dashboard">
  <div class="mb-2 flex items-center gap-2">
    <h3 class="text-xs font-semibold uppercase tracking-wider text-surface-400">
      Metrics
    </h3>
    <div class="h-px flex-1 bg-surface-600"></div>
  </div>

  {#if pushMetrics && pullMetrics}
    <div class="overflow-x-auto">
      <table class="w-full text-xs">
        <caption class="sr-only"
          >Comparison of metrics between push and pull sprint models</caption
        >
        <thead>
          <tr class="text-surface-400">
            <th class="pb-1 pr-2 text-left font-medium">Metric</th>
            <th class="pb-1 pr-2 text-right font-medium">Push</th>
            <th class="pb-1 text-right font-medium">Pull</th>
          </tr>
        </thead>
        <tbody class="font-mono" style="font-variant-numeric: tabular-nums">
          <tr
            class="border-t border-surface-700"
            data-testid="metric-items-completed"
          >
            <td class="py-1 pr-2 font-sans font-medium text-surface-200"
              >Items Completed</td
            >
            <td
              class="py-1 pr-2 text-right {cellColor(
                pushMetrics.itemsCompleted,
                pushMetrics.itemsCompleted,
                pullMetrics.itemsCompleted,
                false,
              )}"
            >
              {pushMetrics.itemsCompleted}
            </td>
            <td
              class="py-1 text-right {cellColor(
                pullMetrics.itemsCompleted,
                pushMetrics.itemsCompleted,
                pullMetrics.itemsCompleted,
                false,
              )}"
            >
              {pullMetrics.itemsCompleted}
            </td>
          </tr>
          <tr
            class="border-t border-surface-700"
            data-testid="metric-items-in-progress"
          >
            <td class="py-1 pr-2 font-sans font-medium text-surface-200"
              >Items In Progress</td
            >
            <td
              class="py-1 pr-2 text-right {cellColor(
                pushMetrics.itemsInProgress,
                pushMetrics.itemsInProgress,
                pullMetrics.itemsInProgress,
              )}"
            >
              {pushMetrics.itemsInProgress}
            </td>
            <td
              class="py-1 text-right {cellColor(
                pullMetrics.itemsInProgress,
                pushMetrics.itemsInProgress,
                pullMetrics.itemsInProgress,
              )}"
            >
              {pullMetrics.itemsInProgress}
            </td>
          </tr>
          <tr
            class="border-t border-surface-700"
            data-testid="metric-avg-lead-time"
          >
            <td class="py-1 pr-2 font-sans font-medium text-surface-200"
              >Avg Lead Time</td
            >
            <td
              class="py-1 pr-2 text-right {cellColor(
                pushMetrics.avgLeadTime,
                pushMetrics.avgLeadTime,
                pullMetrics.avgLeadTime,
              )}"
            >
              {pushMetrics.avgLeadTime > 0
                ? pushMetrics.avgLeadTime.toFixed(1) + ' days'
                : '—'}
            </td>
            <td
              class="py-1 text-right {cellColor(
                pullMetrics.avgLeadTime,
                pushMetrics.avgLeadTime,
                pullMetrics.avgLeadTime,
              )}"
            >
              {pullMetrics.avgLeadTime > 0
                ? pullMetrics.avgLeadTime.toFixed(1) + ' days'
                : '—'}
            </td>
          </tr>
          <tr
            class="border-t border-surface-700"
            data-testid="metric-throughput"
          >
            <td class="py-1 pr-2 font-sans font-medium text-surface-200"
              >Throughput</td
            >
            <td
              class="py-1 pr-2 text-right {cellColor(
                pushMetrics.throughput,
                pushMetrics.throughput,
                pullMetrics.throughput,
                false,
              )}"
            >
              {pushMetrics.throughput > 0
                ? pushMetrics.throughput.toFixed(1) + ' items/day'
                : '—'}
            </td>
            <td
              class="py-1 text-right {cellColor(
                pullMetrics.throughput,
                pushMetrics.throughput,
                pullMetrics.throughput,
                false,
              )}"
            >
              {pullMetrics.throughput > 0
                ? pullMetrics.throughput.toFixed(1) + ' items/day'
                : '—'}
            </td>
          </tr>
          <tr
            class="border-t border-surface-700"
            data-testid="metric-flow-efficiency"
          >
            <td class="py-1 pr-2 font-sans font-medium text-surface-200"
              >Flow Efficiency</td
            >
            <td
              class="py-1 pr-2 text-right {cellColor(
                pushMetrics.flowEfficiency,
                pushMetrics.flowEfficiency,
                pullMetrics.flowEfficiency,
                false,
              )}"
            >
              {(pushMetrics.flowEfficiency * 100).toFixed(0)}%
            </td>
            <td
              class="py-1 text-right {cellColor(
                pullMetrics.flowEfficiency,
                pushMetrics.flowEfficiency,
                pullMetrics.flowEfficiency,
                false,
              )}"
            >
              {(pullMetrics.flowEfficiency * 100).toFixed(0)}%
            </td>
          </tr>
          <tr
            class="border-t border-surface-700"
            data-testid="metric-review-queue"
          >
            <td class="py-1 pr-2 font-sans font-medium text-surface-200"
              >Review Queue</td
            >
            <td
              class="py-1 pr-2 text-right {pushMetrics.reviewQueueDepth > 3
                ? 'text-accent-red'
                : 'text-surface-100'}"
            >
              {pushMetrics.reviewQueueDepth}
            </td>
            <td
              class="py-1 text-right {pullMetrics.reviewQueueDepth > 3
                ? 'text-accent-red'
                : 'text-surface-100'}"
            >
              {pullMetrics.reviewQueueDepth}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  {/if}
</div>
