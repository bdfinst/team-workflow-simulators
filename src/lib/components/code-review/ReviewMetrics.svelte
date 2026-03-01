<script>
  import { WIP_GREEN_MAX, WIP_AMBER_MAX } from '../../simulation/thresholds.js'

  let { pairMetrics, syncMetrics, asyncMetrics, isComplete } = $props()

  const cellColor = (value, allValues, lowerIsBetter = true) => {
    if (!isComplete) return 'text-surface-100'
    const bestVal = lowerIsBetter
      ? Math.min(...allValues)
      : Math.max(...allValues)
    const worstVal = lowerIsBetter
      ? Math.max(...allValues)
      : Math.min(...allValues)
    if (value === bestVal) return 'text-accent-green'
    if (value === worstVal) return 'text-accent-red'
    return 'text-surface-100'
  }

  const wipColor = (count) => {
    if (count <= WIP_GREEN_MAX) return 'text-accent-green'
    if (count <= WIP_AMBER_MAX) return 'text-accent-amber'
    return 'text-accent-red'
  }
  const leadColor = (v) =>
    cellColor(v, [
      pairMetrics.avgLeadTime,
      syncMetrics.avgLeadTime,
      asyncMetrics.avgLeadTime,
    ])
  const tpColor = (v) =>
    cellColor(
      v,
      [pairMetrics.throughput, syncMetrics.throughput, asyncMetrics.throughput],
      false,
    )
  const feColor = (v) =>
    cellColor(
      v,
      [
        pairMetrics.flowEfficiency,
        syncMetrics.flowEfficiency,
        asyncMetrics.flowEfficiency,
      ],
      false,
    )
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
        >Comparison of metrics across three code review approaches</caption
      >
      <thead>
        <tr class="text-surface-400">
          <th class="pb-1 pr-2 text-left font-medium">Metric</th>
          <th class="pb-1 pr-2 text-right font-medium">Pair</th>
          <th class="pb-1 pr-2 text-right font-medium">Sync</th>
          <th class="pb-1 text-right font-medium">Async</th>
        </tr>
      </thead>
      <tbody class="font-mono" style="font-variant-numeric: tabular-nums">
        <tr class="border-t border-surface-700" data-testid="metric-wip-count">
          <td class="py-1 pr-2 font-sans font-medium text-surface-200"
            >WIP Count</td
          >
          <td class="py-1 pr-2 text-right {wipColor(pairMetrics.wipCount)}">
            {pairMetrics.wipCount}
          </td>
          <td class="py-1 pr-2 text-right {wipColor(syncMetrics.wipCount)}">
            {syncMetrics.wipCount}
          </td>
          <td class="py-1 text-right {wipColor(asyncMetrics.wipCount)}">
            {asyncMetrics.wipCount}
          </td>
        </tr>
        <tr
          class="border-t border-surface-700"
          data-testid="metric-avg-lead-time"
        >
          <td class="py-1 pr-2 font-sans font-medium text-surface-200"
            >Avg Lead Time</td
          >
          <td class="py-1 pr-2 text-right {leadColor(pairMetrics.avgLeadTime)}">
            {pairMetrics.avgLeadTime.toFixed(1)}
          </td>
          <td class="py-1 pr-2 text-right {leadColor(syncMetrics.avgLeadTime)}">
            {syncMetrics.avgLeadTime.toFixed(1)}
          </td>
          <td class="py-1 text-right {leadColor(asyncMetrics.avgLeadTime)}">
            {asyncMetrics.avgLeadTime.toFixed(1)}
          </td>
        </tr>
        <tr class="border-t border-surface-700" data-testid="metric-throughput">
          <td class="py-1 pr-2 font-sans font-medium text-surface-200"
            >Throughput</td
          >
          <td class="py-1 pr-2 text-right {tpColor(pairMetrics.throughput)}">
            {pairMetrics.throughput.toFixed(3)}
          </td>
          <td class="py-1 pr-2 text-right {tpColor(syncMetrics.throughput)}">
            {syncMetrics.throughput.toFixed(3)}
          </td>
          <td class="py-1 text-right {tpColor(asyncMetrics.throughput)}">
            {asyncMetrics.throughput.toFixed(3)}
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
            class="py-1 pr-2 text-right {feColor(pairMetrics.flowEfficiency)}"
          >
            {(pairMetrics.flowEfficiency * 100).toFixed(0)}%
          </td>
          <td
            class="py-1 pr-2 text-right {feColor(syncMetrics.flowEfficiency)}"
          >
            {(syncMetrics.flowEfficiency * 100).toFixed(0)}%
          </td>
          <td class="py-1 text-right {feColor(asyncMetrics.flowEfficiency)}">
            {(asyncMetrics.flowEfficiency * 100).toFixed(0)}%
          </td>
        </tr>
        <tr
          class="border-t border-surface-700"
          data-testid="metric-items-completed"
        >
          <td class="py-1 pr-2 font-sans font-medium text-surface-200"
            >Completed</td
          >
          <td class="py-1 pr-2 text-right text-surface-100">
            {pairMetrics.itemsCompleted}
          </td>
          <td class="py-1 pr-2 text-right text-surface-100">
            {syncMetrics.itemsCompleted}
          </td>
          <td class="py-1 text-right text-surface-100">
            {asyncMetrics.itemsCompleted}
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
    <div class="grid grid-cols-3 gap-3 text-xs">
      <div>
        <span class="text-[10px] text-surface-400">Pair</span>
        <div class="mt-0.5 space-y-0.5">
          {#each pairMetrics.queueDepths as q (q.name)}
            <div class="flex items-center justify-between">
              <span class="text-surface-300">{q.name}</span>
              <span class="font-mono text-surface-100">{q.depth}</span>
            </div>
          {/each}
        </div>
      </div>
      <div>
        <span class="text-[10px] text-surface-400">Sync</span>
        <div class="mt-0.5 space-y-0.5">
          {#each syncMetrics.queueDepths as q (q.name)}
            <div class="flex items-center justify-between">
              <span class="text-surface-300">{q.name}</span>
              <span class="font-mono text-surface-100">{q.depth}</span>
            </div>
          {/each}
        </div>
      </div>
      <div>
        <span class="text-[10px] text-surface-400">Async</span>
        <div class="mt-0.5 space-y-0.5">
          {#each asyncMetrics.queueDepths as q (q.name)}
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
