<script>
  import ControlTooltip from './ControlTooltip.svelte'

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
  <label class="flex min-w-[120px] flex-1 flex-col gap-0.5">
    <span class="flex items-center justify-between text-xs text-surface-300">
      <span class="flex items-center">
        WIP Limit
        <ControlTooltip
          text="Max items allowed in each pipeline step before blocking upstream"
        />
      </span>
      <span class="font-mono text-accent-cyan">{config.wipLimit}</span>
    </span>
    <input
      type="range"
      min="1"
      max="10"
      value={config.wipLimit}
      aria-valuetext="{config.wipLimit} items per step"
      oninput={(e) => handleChange('wipLimit', e)}
      disabled={isRunning}
      class="h-1 w-full cursor-pointer accent-accent-cyan"
      data-testid="wip-limit-input"
    />
  </label>

  <label class="flex min-w-[120px] flex-1 flex-col gap-0.5">
    <span class="flex items-center justify-between text-xs text-surface-300">
      <span class="flex items-center">
        Items
        <ControlTooltip text="Total work items to process in the simulation" />
      </span>
      <span class="font-mono text-accent-cyan">{config.workItemCount}</span>
    </span>
    <input
      type="range"
      min="5"
      max="50"
      value={config.workItemCount}
      aria-valuetext="{config.workItemCount} items"
      oninput={(e) => handleChange('workItemCount', e)}
      disabled={isRunning}
      class="h-1 w-full cursor-pointer accent-accent-cyan"
      data-testid="work-item-count-input"
    />
  </label>

  <label class="flex min-w-[100px] flex-1 flex-col gap-0.5">
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
