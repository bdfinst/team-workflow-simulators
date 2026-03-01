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
        Max Retries
        <ControlTooltip
          text="Maximum rework cycles before an item passes review"
        />
      </span>
      <span class="font-mono text-accent-cyan">{config.maxRetries}</span>
    </span>
    <input
      type="range"
      min="0"
      max="3"
      value={config.maxRetries}
      aria-valuetext="{config.maxRetries} review cycles"
      oninput={(e) => handleChange('maxRetries', e)}
      disabled={isRunning}
      class="h-1 w-full cursor-pointer accent-accent-cyan"
      data-testid="max-retries-input"
    />
  </label>

  <label class="flex min-w-[100px] flex-1 flex-col gap-0.5">
    <span class="flex items-center justify-between text-xs text-surface-300">
      <span class="flex items-center">
        Pair Overhead
        <ControlTooltip
          text="Extra time cost when two developers pair-program on one item"
        />
      </span>
      <span class="font-mono text-accent-cyan"
        >{Math.round(config.pairOverhead * 100)}%</span
      >
    </span>
    <input
      type="range"
      min="0"
      max="50"
      value={config.pairOverhead * 100}
      aria-valuetext="{Math.round(config.pairOverhead * 100)} percent overhead"
      oninput={(e) => onupdate('pairOverhead', Number(e.target.value) / 100)}
      disabled={isRunning}
      class="h-1 w-full cursor-pointer accent-accent-cyan"
      data-testid="pair-overhead-input"
    />
  </label>

  <label class="flex min-w-[100px] flex-1 flex-col gap-0.5">
    <span class="flex items-center justify-between text-xs text-surface-300">
      <span class="flex items-center">
        Context Switch
        <ControlTooltip
          text="Time penalty from switching between tasks during synchronous review"
        />
      </span>
      <span class="font-mono text-accent-cyan"
        >{Math.round(config.contextSwitchPenalty * 100)}%</span
      >
    </span>
    <input
      type="range"
      min="0"
      max="50"
      value={config.contextSwitchPenalty * 100}
      aria-valuetext="{Math.round(
        config.contextSwitchPenalty * 100,
      )} percent penalty"
      oninput={(e) =>
        onupdate('contextSwitchPenalty', Number(e.target.value) / 100)}
      disabled={isRunning}
      class="h-1 w-full cursor-pointer accent-accent-cyan"
      data-testid="context-switch-input"
    />
  </label>

  <label class="flex min-w-[100px] flex-1 flex-col gap-0.5">
    <span class="flex items-center justify-between text-xs text-surface-300">
      <span class="flex items-center">
        Sync Wait
        <ControlTooltip
          text="Ticks waiting for a synchronous reviewer to become available"
        />
      </span>
      <span class="font-mono text-accent-cyan">{config.syncWait}t</span>
    </span>
    <input
      type="range"
      min="0"
      max="4"
      value={config.syncWait}
      aria-valuetext="{config.syncWait} ticks wait time"
      oninput={(e) => handleChange('syncWait', e)}
      disabled={isRunning}
      class="h-1 w-full cursor-pointer accent-accent-cyan"
      data-testid="sync-wait-input"
    />
  </label>

  <label class="flex min-w-[100px] flex-1 flex-col gap-0.5">
    <span class="flex items-center justify-between text-xs text-surface-300">
      <span class="flex items-center">
        Async Wait
        <ControlTooltip
          text="Idle ticks waiting for an async reviewer to respond, applies to review and rework"
        />
      </span>
      <span class="font-mono text-accent-cyan">{config.asyncWait}t</span>
    </span>
    <input
      type="range"
      min="1"
      max="8"
      value={config.asyncWait}
      aria-valuetext="{config.asyncWait} ticks wait time"
      oninput={(e) => handleChange('asyncWait', e)}
      disabled={isRunning}
      class="h-1 w-full cursor-pointer accent-accent-cyan"
      data-testid="async-wait-input"
    />
  </label>

  <label class="flex min-w-[100px] flex-1 flex-col gap-0.5">
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
