<script>
  let { config, isRunning, onupdate, onstart, onstop, onstep, onreset } =
    $props()

  function handleChange(key, e) {
    onupdate(key, Number(e.target.value))
  }
</script>

<div class="rounded-lg bg-white p-4 shadow-md" data-testid="parameter-controls">
  <h3 class="mb-4 text-lg font-semibold">Parameters</h3>

  <div class="space-y-4">
    <label class="block">
      <span class="text-sm font-medium text-gray-700">WIP Limit per Step</span>
      <input
        type="range"
        min="1"
        max="10"
        value={config.wipLimit}
        oninput={(e) => handleChange('wipLimit', e)}
        disabled={isRunning}
        class="mt-1 w-full"
        data-testid="wip-limit-input"
      />
      <span class="text-sm text-gray-500">{config.wipLimit}</span>
    </label>

    <label class="block">
      <span class="text-sm font-medium text-gray-700">Work Item Count</span>
      <input
        type="range"
        min="5"
        max="50"
        value={config.workItemCount}
        oninput={(e) => handleChange('workItemCount', e)}
        disabled={isRunning}
        class="mt-1 w-full"
        data-testid="work-item-count-input"
      />
      <span class="text-sm text-gray-500">{config.workItemCount}</span>
    </label>

    <label class="block">
      <span class="text-sm font-medium text-gray-700">
        Process Time Spread
      </span>
      <input
        type="range"
        min="0"
        max="100"
        value={config.processTimeSpread * 100}
        oninput={(e) =>
          onupdate('processTimeSpread', Number(e.target.value) / 100)}
        disabled={isRunning}
        class="mt-1 w-full"
        data-testid="process-time-spread-input"
      />
      <span class="text-sm text-gray-500">
        ±{Math.round(config.processTimeSpread * 100)}%
      </span>
    </label>

    <label class="block">
      <span class="text-sm font-medium text-gray-700">Simulation Speed</span>
      <input
        type="range"
        min="0.5"
        max="4"
        step="0.5"
        value={config.simulationSpeed}
        oninput={(e) => handleChange('simulationSpeed', e)}
        class="mt-1 w-full"
        data-testid="simulation-speed-input"
      />
      <span class="text-sm text-gray-500">{config.simulationSpeed}x</span>
    </label>

    <label class="block">
      <span class="text-sm font-medium text-gray-700">Arrival Rate</span>
      <input
        type="range"
        min="0.5"
        max="3"
        step="0.5"
        value={config.arrivalRate}
        oninput={(e) => handleChange('arrivalRate', e)}
        disabled={isRunning}
        class="mt-1 w-full"
        data-testid="arrival-rate-input"
      />
      <span class="text-sm text-gray-500">
        {config.arrivalRate} item{config.arrivalRate !== 1 ? 's' : ''}/tick
      </span>
    </label>
  </div>

  <div class="mt-6 flex flex-wrap gap-2">
    {#if !isRunning}
      <button
        onclick={onstart}
        class="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        data-testid="start-button"
      >
        Start
      </button>
    {:else}
      <button
        onclick={onstop}
        class="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        data-testid="stop-button"
      >
        Pause
      </button>
    {/if}

    <button
      onclick={onstep}
      disabled={isRunning}
      class="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      data-testid="step-button"
    >
      Step
    </button>

    <button
      onclick={onreset}
      class="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      data-testid="reset-button"
    >
      Reset
    </button>
  </div>
</div>
