/**
 * Create a plain-data snapshot of a pipeline for reactive UI consumption.
 * Returns new object/array references so Svelte detects the change.
 * @param {Object} pipeline - A pipeline created by createPipeline
 * @returns {Object} Snapshot with getSteps(), getCompleted(), incomingCount
 */
export const snapshotPipeline = (pipeline) => {
  const steps = pipeline.getSteps().map((s) => ({
    name: s.name,
    baseProcessTime: s.baseProcessTime,
    wipLimit: s.wipLimit,
    workerCount: s.workerCount,
    queue: [...s.queue],
    active: [...s.active],
  }))

  const completed = [...pipeline.getCompleted()]
  const incomingCount = pipeline.getIncoming().length

  return {
    getSteps: () => steps,
    getCompleted: () => completed,
    incomingCount,
  }
}
