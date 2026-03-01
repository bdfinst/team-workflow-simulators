/**
 * Apply variability to a base process time
 * @param {number} baseTime - The base process time
 * @param {number} spread - Variability as a decimal (0 = none, 0.3 = ±30%)
 * @returns {number} Adjusted process time (integer, minimum 1)
 */
export const applyVariability = (baseTime, spread) => {
  if (spread === 0) return baseTime
  const min = baseTime * (1 - spread)
  const max = baseTime * (1 + spread)
  const result = Math.round(min + Math.random() * (max - min))
  return Math.max(1, result)
}
