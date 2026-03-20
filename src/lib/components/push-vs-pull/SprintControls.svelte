<script>
  import ControlTooltip from '../simulator/ControlTooltip.svelte'

  let { config, isRunning, onupdate, onstart, onstop, onstep, onreset } =
    $props()

  function handleChange(key, e) {
    onupdate(key, Number(e.target.value))
  }
</script>

<div
  class="flex flex-wrap items-end gap-x-6 gap-y-2 rounded-lg border border-surface-600 bg-surface-800 px-4 py-3"
  data-testid="parameter-controls"
>
  <label class="flex min-w-[100px] flex-1 flex-col gap-0.5">
    <span class="flex items-center justify-between text-xs text-surface-300">
      <span class="flex items-center">
        Sprint Days
        <ControlTooltip text="Length of the sprint in working days" />
      </span>
      <span class="font-mono text-accent-cyan">{config.sprintDays}</span>
    </span>
    <input
      type="range"
      min="5"
      max="20"
      value={config.sprintDays}
      aria-valuetext="{config.sprintDays} days"
      oninput={(e) => handleChange('sprintDays', e)}
      disabled={isRunning}
      class="h-1 w-full cursor-pointer accent-accent-cyan"
      data-testid="sprint-days-input"
    />
  </label>

  <label class="flex min-w-[100px] flex-1 flex-col gap-0.5">
    <span class="flex items-center justify-between text-xs text-surface-300">
      <span class="flex items-center">
        Push Review Check
        <ControlTooltip
          text="How often push members check for reviews (in days)"
        />
      </span>
      <span class="font-mono text-accent-cyan"
        >{config.pushReviewCheckInterval / config.ticksPerDay}d</span
      >
    </span>
    <input
      type="range"
      min="8"
      max="32"
      step="8"
      value={config.pushReviewCheckInterval}
      aria-valuetext="{config.pushReviewCheckInterval /
        config.ticksPerDay} days between review checks"
      oninput={(e) => handleChange('pushReviewCheckInterval', e)}
      disabled={isRunning}
      class="h-1 w-full cursor-pointer accent-accent-cyan"
      data-testid="push-review-interval-input"
    />
  </label>

  <label class="flex min-w-[100px] flex-1 flex-col gap-0.5">
    <span class="flex items-center justify-between text-xs text-surface-300">
      <span class="flex items-center">
        Push Review Time
        <ControlTooltip
          text="Ticks for push reviews (larger tasks = slower reviews)"
        />
      </span>
      <span class="font-mono text-accent-cyan"
        >{config.pushReviewTicks[0]}-{config.pushReviewTicks[1]}t</span
      >
    </span>
    <input
      type="range"
      min="4"
      max="12"
      value={config.pushReviewTicks[1]}
      aria-valuetext="{config.pushReviewTicks[1]} max ticks for push review"
      oninput={(e) => {
        const max = Number(e.target.value)
        const min = Math.max(2, max - 2)
        onupdate('pushReviewTicks', [min, max])
      }}
      disabled={isRunning}
      class="h-1 w-full cursor-pointer accent-accent-cyan"
      data-testid="push-review-ticks-input"
    />
  </label>

  <label class="flex min-w-[100px] flex-1 flex-col gap-0.5">
    <span class="flex items-center justify-between text-xs text-surface-300">
      <span class="flex items-center">
        Pull Dev Time
        <ControlTooltip
          text="Tick range for pull model dev time (small tasks)"
        />
      </span>
      <span class="font-mono text-accent-cyan"
        >{config.pullDevTicks[0]}-{config.pullDevTicks[1]}t</span
      >
    </span>
    <input
      type="range"
      min="2"
      max="12"
      value={config.pullDevTicks[1]}
      aria-valuetext="{config.pullDevTicks[1]} max ticks for pull dev"
      oninput={(e) => {
        const max = Number(e.target.value)
        const min = Math.max(1, max - 4)
        onupdate('pullDevTicks', [min, max])
      }}
      disabled={isRunning}
      class="h-1 w-full cursor-pointer accent-accent-cyan"
      data-testid="pull-dev-ticks-input"
    />
  </label>

  <label class="flex min-w-[80px] flex-1 flex-col gap-0.5">
    <span class="flex items-center justify-between text-xs text-surface-300">
      <span class="flex items-center">
        Speed
        <ControlTooltip text="Playback speed multiplier for the simulation" />
      </span>
      <span class="font-mono text-accent-cyan">{config.simulationSpeed}x</span>
    </span>
    <input
      type="range"
      min="0.5"
      max="4"
      step="0.5"
      value={config.simulationSpeed}
      aria-valuetext="{config.simulationSpeed} times speed"
      oninput={(e) => handleChange('simulationSpeed', e)}
      class="h-1 w-full cursor-pointer accent-accent-cyan"
      data-testid="simulation-speed-input"
    />
  </label>

  <!-- Action buttons -->
  <div class="flex gap-1.5">
    <button
      onclick={isRunning ? onstop : onstart}
      class="rounded px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-1 focus:ring-offset-surface-900 {isRunning
        ? 'bg-surface-500 text-surface-100 hover:bg-surface-400'
        : 'bg-accent-cyan text-surface-900 hover:bg-accent-cyan/80'}"
      aria-label={isRunning ? 'Pause simulation' : 'Start simulation'}
      data-testid={isRunning ? 'stop-button' : 'start-button'}
    >
      {isRunning ? 'Pause' : 'Start'}
    </button>

    <button
      onclick={onstep}
      disabled={isRunning}
      class="rounded border border-surface-500 px-3 py-1.5 text-xs font-medium text-surface-200 transition-colors hover:bg-surface-600 focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-1 focus:ring-offset-surface-900 disabled:cursor-not-allowed disabled:opacity-40"
      data-testid="step-button"
    >
      Step
    </button>

    <button
      onclick={onreset}
      class="rounded border border-surface-500 px-3 py-1.5 text-xs font-medium text-surface-200 transition-colors hover:bg-surface-600 focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-1 focus:ring-offset-surface-900"
      data-testid="reset-button"
    >
      Reset
    </button>
  </div>
</div>
