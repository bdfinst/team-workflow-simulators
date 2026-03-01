/**
 * Calculate live metrics for a pipeline
 * @param {Object} pipeline - A pipeline created by createPipeline
 * @returns {Object} Metrics snapshot
 */
export const calculateMetrics = (pipeline) => {
  const steps = pipeline.getSteps()
  const completed = pipeline.getCompleted()
  const tick = pipeline.getTick()

  const wipCount = steps.reduce(
    (sum, step) => sum + step.active.length + step.queue.length,
    0,
  )

  const itemsCompleted = completed.length

  const avgLeadTime =
    itemsCompleted > 0
      ? completed.reduce(
          (sum, item) => sum + (item.completionTick - item.entryTick),
          0,
        ) / itemsCompleted
      : 0

  const throughput = tick > 0 ? itemsCompleted / tick : 0

  const queueDepths = steps.map((step) => ({
    name: step.name,
    depth: step.queue.length,
  }))

  const totalProcessTime =
    itemsCompleted > 0
      ? completed.reduce((sum, item) => sum + item.totalProcessTime, 0) /
        itemsCompleted
      : 0

  const flowEfficiency = avgLeadTime > 0 ? totalProcessTime / avgLeadTime : 0

  return {
    wipCount,
    avgLeadTime,
    throughput,
    itemsCompleted,
    queueDepths,
    flowEfficiency,
  }
}
