<script>
  let { pipeline, label, variant = 'neutral', isRunning = false } = $props()

  const variantBorder = {
    danger: 'border-accent-red/40',
    success: 'border-accent-green/40',
    neutral: 'border-surface-600',
  }

  const variantLabel = {
    danger: 'text-accent-red',
    success: 'text-accent-green',
    neutral: 'text-surface-200',
  }

  const labelId = $derived(label.toLowerCase().replace(/\s+/g, '-'))
</script>

<section
  class="rounded-lg border bg-surface-800 {variantBorder[variant]}"
  aria-labelledby="pipeline-heading-{labelId}"
  data-testid="pipeline-{labelId}"
>
  <div
    class="flex items-center justify-between border-b border-surface-600 px-3 py-2"
  >
    <h3
      id="pipeline-heading-{labelId}"
      class="text-sm font-semibold {variantLabel[variant]}"
      data-testid="pipeline-label"
    >
      {label}
    </h3>
    <span class="font-mono text-xs text-surface-300">
      Done: {pipeline.getCompleted().length}
    </span>
  </div>

  <!-- Horizontal step flow -->
  <div class="flex items-stretch gap-0 overflow-x-auto p-2">
    {#each pipeline.getSteps() as step, i (step.name)}
      {#if i > 0}
        <div
          class="flex shrink-0 items-center px-1 text-surface-500 {isRunning
            ? 'animate-flow-arrow'
            : ''}"
        >
          <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      {/if}
      <div
        class="flex min-w-[100px] flex-1 flex-col rounded bg-surface-700 p-2"
        data-testid="step-{step.name.toLowerCase().replace(/\s+/g, '-')}"
      >
        <div class="mb-1.5 flex items-center justify-between gap-2">
          <span class="text-xs font-medium text-surface-100">{step.name}</span>
          {#if step.wipLimit !== Infinity}
            <span
              class="shrink-0 rounded bg-accent-blue/15 px-1.5 py-0.5 font-mono text-[10px] text-accent-blue"
            >
              {step.active.length}/{step.wipLimit}
            </span>
          {/if}
        </div>

        <!-- Queue -->
        <div class="mb-1">
          <span class="text-[10px] text-surface-400"
            >Queue ({step.queue.length})</span
          >
          <div class="flex min-h-[18px] flex-wrap gap-0.5" role="list">
            {#each step.queue as item (item.id)}
              <div
                class="h-3 w-3 rounded-sm bg-accent-amber"
                role="listitem"
                aria-label="{item.id}, waiting in queue"
                data-testid="queue-item"
              ></div>
            {/each}
          </div>
        </div>

        <!-- Active -->
        <div>
          <span class="text-[10px] text-surface-400"
            >Active ({step.active.length})</span
          >
          <div class="flex min-h-[18px] flex-wrap gap-0.5" role="list">
            {#each step.active as item (item.id)}
              <div
                class="h-3 w-3 rounded-sm {item.remaining <= 1
                  ? 'bg-accent-green'
                  : 'bg-accent-blue'} {isRunning ? 'animate-active-pulse' : ''}"
                role="listitem"
                aria-label="{item.id}, {item.remaining <= 1
                  ? 'almost done'
                  : 'in progress'}, remaining: {item.remaining}"
                data-testid="active-item"
              ></div>
            {/each}
          </div>
        </div>
      </div>
    {/each}

    <!-- Completed column -->
    <div
      class="flex shrink-0 items-center px-1 text-surface-500 {isRunning
        ? 'animate-flow-arrow'
        : ''}"
    >
      <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
          clip-rule="evenodd"
        />
      </svg>
    </div>
    <div class="flex min-w-[80px] flex-col rounded bg-surface-700/50 p-2">
      <span class="mb-1.5 text-xs font-medium text-accent-green">Done</span>
      <div class="flex min-h-[18px] flex-wrap gap-0.5" role="list">
        {#each pipeline.getCompleted() as item (item.id)}
          <div
            class="h-3 w-3 rounded-sm bg-accent-green/70"
            role="listitem"
            aria-label="{item.id}, completed"
            data-testid="completed-item"
          ></div>
        {/each}
      </div>
    </div>
  </div>
</section>
