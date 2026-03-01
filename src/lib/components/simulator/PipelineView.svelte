<script>
  let { pipeline, label, variant = 'neutral' } = $props()

  const variantClasses = {
    danger: 'border-red-300 bg-red-50',
    success: 'border-green-300 bg-green-50',
    neutral: 'border-gray-300 bg-gray-50',
  }

  const labelId = $derived(label.toLowerCase().replace(/\s+/g, '-'))
</script>

<section
  class="rounded-lg border-2 p-4 {variantClasses[variant]}"
  aria-labelledby="pipeline-heading-{labelId}"
  data-testid="pipeline-{labelId}"
>
  <h3
    id="pipeline-heading-{labelId}"
    class="mb-4 text-lg font-semibold"
    data-testid="pipeline-label"
  >
    {label}
  </h3>

  <div class="space-y-3">
    {#each pipeline.getSteps() as step (step.name)}
      <div
        class="rounded bg-white p-3 shadow-sm"
        data-testid="step-{step.name.toLowerCase().replace(/\s+/g, '-')}"
      >
        <div class="mb-2 flex items-center justify-between">
          <span class="font-medium text-sm">{step.name}</span>
          {#if step.wipLimit !== Infinity}
            <span
              class="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700"
            >
              WIP: {step.active.length}/{step.wipLimit}
            </span>
          {/if}
        </div>

        <!-- Queue -->
        <div class="mb-1">
          <span class="text-xs text-gray-500">Queue ({step.queue.length})</span>
          <div class="flex flex-wrap gap-1 min-h-[24px]" role="list">
            {#each step.queue as item (item.id)}
              <div
                class="h-5 w-5 rounded bg-amber-400"
                role="listitem"
                aria-label="{item.id}, waiting in queue"
                data-testid="queue-item"
              >
                <span class="sr-only">{item.id} - waiting</span>
              </div>
            {/each}
          </div>
        </div>

        <!-- Active -->
        <div>
          <span class="text-xs text-gray-500"
            >Active ({step.active.length})</span
          >
          <div class="flex flex-wrap gap-1 min-h-[24px]" role="list">
            {#each step.active as item (item.id)}
              <div
                class="h-5 w-5 rounded {item.remaining <= 1
                  ? 'bg-green-500'
                  : 'bg-blue-500'}"
                role="listitem"
                aria-label="{item.id}, {item.remaining <= 1
                  ? 'almost done'
                  : 'in progress'}, remaining: {item.remaining}"
                data-testid="active-item"
              >
                <span class="sr-only"
                  >{item.id} - {item.remaining <= 1
                    ? 'almost done'
                    : 'in progress'}</span
                >
              </div>
            {/each}
          </div>
        </div>
      </div>
    {/each}
  </div>

  <!-- Completed -->
  <div class="mt-3 rounded bg-white p-3 shadow-sm">
    <span class="text-xs text-gray-500">
      Completed ({pipeline.getCompleted().length})
    </span>
    <div class="flex flex-wrap gap-1 min-h-[24px]" role="list">
      {#each pipeline.getCompleted() as item (item.id)}
        <div
          class="h-5 w-5 rounded bg-green-600"
          role="listitem"
          aria-label="{item.id}, completed"
          data-testid="completed-item"
        >
          <span class="sr-only">{item.id} - completed</span>
        </div>
      {/each}
    </div>
  </div>
</section>
