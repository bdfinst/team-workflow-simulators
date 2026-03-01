<script>
  let { unboundedMetrics, wipLimitedMetrics, isComplete } = $props()

  const better = (a, b, lowerIsBetter = true) => {
    if (a === b) return 'neutral'
    if (lowerIsBetter) return a < b ? 'better' : 'worse'
    return a > b ? 'better' : 'worse'
  }

  const statusClass = (status) => {
    if (status === 'better')
      return 'bg-green-50 border-green-200 text-green-700'
    if (status === 'worse') return 'bg-red-50 border-red-200 text-red-700'
    return 'bg-gray-50 border-gray-200 text-gray-700'
  }

  const statusLabel = (status) => {
    if (status === 'better') return '(better)'
    if (status === 'worse') return '(worse)'
    return ''
  }
</script>

{#snippet metricCell(value, status)}
  <span
    class="rounded border px-2 py-0.5 {isComplete ? statusClass(status) : ''}"
  >
    {value}
    {#if isComplete}
      <span class="sr-only">{statusLabel(status)}</span>
    {/if}
  </span>
{/snippet}

<div class="rounded-lg bg-white p-4 shadow-md" data-testid="metrics-dashboard">
  <h3 class="mb-4 text-lg font-semibold">Metrics Comparison</h3>

  <div class="overflow-x-auto">
    <table class="w-full text-sm">
      <caption class="sr-only"
        >Comparison of metrics between unbounded and WIP-limited pipelines</caption
      >
      <thead>
        <tr class="border-b text-left">
          <th class="pb-2 pr-4">Metric</th>
          <th class="pb-2 pr-4">No WIP Limit</th>
          <th class="pb-2">WIP-Limited</th>
        </tr>
      </thead>
      <tbody>
        <tr class="border-b" data-testid="metric-wip-count">
          <td class="py-2 pr-4 font-medium">WIP Count</td>
          <td class="py-2 pr-4">
            {@render metricCell(
              unboundedMetrics.wipCount,
              better(unboundedMetrics.wipCount, wipLimitedMetrics.wipCount),
            )}
          </td>
          <td class="py-2">
            {@render metricCell(
              wipLimitedMetrics.wipCount,
              better(wipLimitedMetrics.wipCount, unboundedMetrics.wipCount),
            )}
          </td>
        </tr>
        <tr class="border-b" data-testid="metric-avg-lead-time">
          <td class="py-2 pr-4 font-medium">Avg Lead Time</td>
          <td class="py-2 pr-4">
            {@render metricCell(
              unboundedMetrics.avgLeadTime.toFixed(1),
              better(
                unboundedMetrics.avgLeadTime,
                wipLimitedMetrics.avgLeadTime,
              ),
            )}
          </td>
          <td class="py-2">
            {@render metricCell(
              wipLimitedMetrics.avgLeadTime.toFixed(1),
              better(
                wipLimitedMetrics.avgLeadTime,
                unboundedMetrics.avgLeadTime,
              ),
            )}
          </td>
        </tr>
        <tr class="border-b" data-testid="metric-throughput">
          <td class="py-2 pr-4 font-medium">Throughput</td>
          <td class="py-2 pr-4">
            {@render metricCell(
              unboundedMetrics.throughput.toFixed(3),
              better(
                unboundedMetrics.throughput,
                wipLimitedMetrics.throughput,
                false,
              ),
            )}
          </td>
          <td class="py-2">
            {@render metricCell(
              wipLimitedMetrics.throughput.toFixed(3),
              better(
                wipLimitedMetrics.throughput,
                unboundedMetrics.throughput,
                false,
              ),
            )}
          </td>
        </tr>
        <tr class="border-b" data-testid="metric-flow-efficiency">
          <td class="py-2 pr-4 font-medium">Flow Efficiency</td>
          <td class="py-2 pr-4">
            {@render metricCell(
              `${(unboundedMetrics.flowEfficiency * 100).toFixed(0)}%`,
              better(
                unboundedMetrics.flowEfficiency,
                wipLimitedMetrics.flowEfficiency,
                false,
              ),
            )}
          </td>
          <td class="py-2">
            {@render metricCell(
              `${(wipLimitedMetrics.flowEfficiency * 100).toFixed(0)}%`,
              better(
                wipLimitedMetrics.flowEfficiency,
                unboundedMetrics.flowEfficiency,
                false,
              ),
            )}
          </td>
        </tr>
        <tr data-testid="metric-items-completed">
          <td class="py-2 pr-4 font-medium">Items Completed</td>
          <td class="py-2 pr-4">
            <span class="rounded border px-2 py-0.5">
              {unboundedMetrics.itemsCompleted}
            </span>
          </td>
          <td class="py-2">
            <span class="rounded border px-2 py-0.5">
              {wipLimitedMetrics.itemsCompleted}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Queue depths -->
  <div class="mt-4" data-testid="queue-depths">
    <h4 class="mb-2 text-sm font-medium text-gray-600">Queue Depth per Step</h4>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <span class="text-xs text-gray-500">No WIP Limit</span>
        <div class="mt-1 space-y-1">
          {#each unboundedMetrics.queueDepths as q (q.name)}
            <div class="flex items-center justify-between text-xs">
              <span>{q.name}</span>
              <span class="rounded bg-gray-100 px-2 py-0.5 font-mono"
                >{q.depth}</span
              >
            </div>
          {/each}
        </div>
      </div>
      <div>
        <span class="text-xs text-gray-500">WIP-Limited</span>
        <div class="mt-1 space-y-1">
          {#each wipLimitedMetrics.queueDepths as q (q.name)}
            <div class="flex items-center justify-between text-xs">
              <span>{q.name}</span>
              <span class="rounded bg-gray-100 px-2 py-0.5 font-mono"
                >{q.depth}</span
              >
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>
