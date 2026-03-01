<script>
  import ControlTooltip from './ControlTooltip.svelte'

  let { config, isRunning, onupdate } = $props()

  let expanded = $state(false)

  function handleChange(key, e) {
    onupdate(key, Number(e.target.value))
  }
</script>

<div
  class="rounded-lg border border-surface-600 bg-surface-800"
  data-testid="config-panel"
>
  <button
    onclick={() => (expanded = !expanded)}
    class="flex w-full items-center justify-between px-4 py-2 text-xs font-medium text-surface-300 transition-colors hover:text-surface-100 focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-1 focus:ring-offset-surface-900"
    aria-expanded={expanded}
    aria-controls="config-panel-body"
    data-testid="config-panel-toggle"
  >
    <span class="flex items-center gap-2">
      <svg
        class="h-3.5 w-3.5 transition-transform {expanded ? 'rotate-90' : ''}"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
      </svg>
      Configuration
    </span>
    <span class="font-mono text-surface-500">
      Team {config.teamSize} | Dev {config.devTime} | Review {config.reviewTime}
      | Test {config.testTime} | Deploy {config.deployTime}
    </span>
  </button>

  {#if expanded}
    <div
      id="config-panel-body"
      class="flex flex-wrap items-end gap-x-6 gap-y-2 border-t border-surface-600 px-4 py-3"
      data-testid="config-panel-body"
    >
      <label class="flex min-w-[100px] flex-1 flex-col gap-0.5">
        <span
          class="flex items-center justify-between text-xs text-surface-300"
        >
          <span class="flex items-center">
            Team Size
            <ControlTooltip
              text="Number of developers working in parallel across pipeline steps"
            />
          </span>
          <span class="font-mono text-accent-cyan">{config.teamSize}</span>
        </span>
        <input
          type="range"
          min="1"
          max="12"
          value={config.teamSize}
          aria-valuetext="{config.teamSize} developers"
          oninput={(e) => handleChange('teamSize', e)}
          disabled={isRunning}
          class="h-1 w-full cursor-pointer accent-accent-cyan"
          data-testid="config-team-size-input"
        />
      </label>

      <label class="flex min-w-[100px] flex-1 flex-col gap-0.5">
        <span
          class="flex items-center justify-between text-xs text-surface-300"
        >
          <span class="flex items-center">
            Dev Time
            <ControlTooltip
              text="Base ticks to complete development work on one item"
            />
          </span>
          <span class="font-mono text-accent-cyan">{config.devTime}t</span>
        </span>
        <input
          type="range"
          min="1"
          max="10"
          value={config.devTime}
          aria-valuetext="{config.devTime} ticks"
          oninput={(e) => handleChange('devTime', e)}
          disabled={isRunning}
          class="h-1 w-full cursor-pointer accent-accent-cyan"
          data-testid="config-dev-time-input"
        />
      </label>

      <label class="flex min-w-[100px] flex-1 flex-col gap-0.5">
        <span
          class="flex items-center justify-between text-xs text-surface-300"
        >
          <span class="flex items-center">
            Review Time
            <ControlTooltip text="Base ticks for a code review pass" />
          </span>
          <span class="font-mono text-accent-cyan">{config.reviewTime}t</span>
        </span>
        <input
          type="range"
          min="1"
          max="10"
          value={config.reviewTime}
          aria-valuetext="{config.reviewTime} ticks"
          oninput={(e) => handleChange('reviewTime', e)}
          disabled={isRunning}
          class="h-1 w-full cursor-pointer accent-accent-cyan"
          data-testid="config-review-time-input"
        />
      </label>

      <label class="flex min-w-[100px] flex-1 flex-col gap-0.5">
        <span
          class="flex items-center justify-between text-xs text-surface-300"
        >
          <span class="flex items-center">
            Test Time
            <ControlTooltip text="Base ticks to run tests on one item" />
          </span>
          <span class="font-mono text-accent-cyan">{config.testTime}t</span>
        </span>
        <input
          type="range"
          min="1"
          max="10"
          value={config.testTime}
          aria-valuetext="{config.testTime} ticks"
          oninput={(e) => handleChange('testTime', e)}
          disabled={isRunning}
          class="h-1 w-full cursor-pointer accent-accent-cyan"
          data-testid="config-test-time-input"
        />
      </label>

      <label class="flex min-w-[100px] flex-1 flex-col gap-0.5">
        <span
          class="flex items-center justify-between text-xs text-surface-300"
        >
          <span class="flex items-center">
            Deploy Time
            <ControlTooltip
              text="Base ticks to deploy one item to production"
            />
          </span>
          <span class="font-mono text-accent-cyan">{config.deployTime}t</span>
        </span>
        <input
          type="range"
          min="1"
          max="10"
          value={config.deployTime}
          aria-valuetext="{config.deployTime} ticks"
          oninput={(e) => handleChange('deployTime', e)}
          disabled={isRunning}
          class="h-1 w-full cursor-pointer accent-accent-cyan"
          data-testid="config-deploy-time-input"
        />
      </label>

      <label class="flex min-w-[100px] flex-1 flex-col gap-0.5">
        <span
          class="flex items-center justify-between text-xs text-surface-300"
        >
          <span class="flex items-center">
            Spread
            <ControlTooltip
              text="Random variation applied to process times each tick"
            />
          </span>
          <span class="font-mono text-accent-cyan"
            >&plusmn;{Math.round(config.processTimeSpread * 100)}%</span
          >
        </span>
        <input
          type="range"
          min="0"
          max="100"
          value={config.processTimeSpread * 100}
          aria-valuetext="plus or minus {Math.round(
            config.processTimeSpread * 100,
          )} percent"
          oninput={(e) =>
            onupdate('processTimeSpread', Number(e.target.value) / 100)}
          disabled={isRunning}
          class="h-1 w-full cursor-pointer accent-accent-cyan"
          data-testid="config-spread-input"
        />
      </label>

      <label class="flex min-w-[100px] flex-1 flex-col gap-0.5">
        <span
          class="flex items-center justify-between text-xs text-surface-300"
        >
          <span class="flex items-center">
            Arrival
            <ControlTooltip
              text="How many new work items enter the pipeline per tick"
            />
          </span>
          <span class="font-mono text-accent-cyan"
            >{config.arrivalRate}/tick</span
          >
        </span>
        <input
          type="range"
          min="0.5"
          max="3"
          step="0.5"
          value={config.arrivalRate}
          aria-valuetext="{config.arrivalRate} {config.arrivalRate === 1
            ? 'item'
            : 'items'} per tick"
          oninput={(e) => handleChange('arrivalRate', e)}
          disabled={isRunning}
          class="h-1 w-full cursor-pointer accent-accent-cyan"
          data-testid="config-arrival-rate-input"
        />
      </label>
    </div>
  {/if}
</div>
