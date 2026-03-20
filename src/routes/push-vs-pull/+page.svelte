<script>
  import { pushVsPullStore } from '$lib/stores/pushVsPullStore.svelte.js'
  import SprintControls from '$lib/components/push-vs-pull/SprintControls.svelte'
  import SprintMetrics from '$lib/components/push-vs-pull/SprintMetrics.svelte'
  import SprintCallouts from '$lib/components/push-vs-pull/SprintCallouts.svelte'

  const sim = pushVsPullStore

  function handleConfigUpdate(key, value) {
    sim.updateConfig(key, value)
    sim.reset()
  }

  const stateStyles = {
    coding: 'bg-blue-500/20 text-blue-300',
    reviewing: 'bg-purple-500/20 text-purple-300',
    idle: 'bg-surface-700/50 text-surface-400',
  }

  const stateIcons = {
    coding: '\u{1F528}',
    reviewing: '\u{1F440}',
    idle: '\u{1F4A4}',
  }
</script>

<main
  class="flex h-screen flex-col bg-surface-900 p-3"
  data-testid="push-vs-pull-page"
>
  <!-- Top bar -->
  <header class="mb-3 flex items-center gap-4">
    <a
      href="/"
      class="text-surface-400 transition-colors hover:text-surface-100"
      aria-label="Back to home"
    >
      <svg
        class="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
    </a>
    <h1 class="text-lg font-semibold text-surface-50">
      Push vs Pull Sprints
      <span class="font-normal text-surface-400">Simulator</span>
    </h1>

    <div class="ml-auto flex items-center gap-3">
      <div class="text-sm text-surface-300" data-testid="day-counter">
        Day {sim.pushSnapshot?.day ?? 1} of
        {sim.pushSnapshot?.sprintDays ?? 10}
      </div>

      {#if sim.isComplete}
        <div
          class="rounded-full border border-accent-green/30 bg-accent-green/10 px-3 py-1 text-xs font-medium text-accent-green"
          role="status"
          data-testid="completion-banner"
        >
          Sprint complete — Push: {sim.pushMetrics?.itemsCompleted ?? 0} done, Pull:
          {sim.pullMetrics?.itemsCompleted ?? 0} done
        </div>
      {/if}
    </div>
  </header>

  <!-- Controls strip -->
  <div class="mb-2">
    <SprintControls
      config={sim.config}
      isRunning={sim.isRunning}
      onupdate={handleConfigUpdate}
      onstart={() => sim.start()}
      onstop={() => sim.stop()}
      onstep={() => sim.step()}
      onreset={() => sim.reset()}
    />
  </div>

  <!-- Main content: panels + sidebar -->
  <div class="mt-1 grid min-h-0 flex-1 grid-cols-1 gap-3 xl:grid-cols-4">
    <!-- Side-by-side team panels -->
    <div class="grid min-h-0 grid-cols-1 gap-3 md:grid-cols-2 xl:col-span-3">
      {#snippet teamPanel(snapshot, label, variant, testId)}
        <div
          class="flex flex-col rounded-lg border border-surface-600 bg-surface-800 p-3"
          data-testid={testId}
        >
          <h2
            class="mb-3 text-sm font-semibold {variant === 'danger'
              ? 'text-red-400'
              : 'text-green-400'}"
          >
            {label}
          </h2>

          {#if snapshot}
            <!-- Member rows -->
            <div class="flex flex-col gap-1.5">
              {#each snapshot.members as member (member.id)}
                <div
                  class="flex items-center gap-2 rounded px-2.5 py-1.5 text-sm {stateStyles[
                    member.state
                  ]}"
                  data-testid="member-row-{member.name}"
                >
                  <span class="w-12 font-medium">{member.name}</span>
                  <span class="text-base">{stateIcons[member.state]}</span>
                  <span class="truncate text-xs">
                    {#if member.state === 'idle'}
                      idle
                    {:else if member.currentItem}
                      {member.currentItem.id}
                    {/if}
                  </span>
                </div>
              {/each}
            </div>

            <!-- Summary stats -->
            <div
              class="mt-auto flex gap-4 border-t border-surface-600 pt-2 text-xs text-surface-400"
            >
              <span>Review queue: {snapshot.reviewQueue.length}</span>
              <span>Done: {snapshot.completed.length}</span>
              <span>Backlog: {snapshot.backlog.length}</span>
            </div>
          {:else}
            <div class="text-sm text-surface-500">Initializing...</div>
          {/if}
        </div>
      {/snippet}

      {@render teamPanel(
        sim.pushSnapshot,
        'Push / Assigned',
        'danger',
        'push-panel',
      )}
      {@render teamPanel(
        sim.pullSnapshot,
        'Pull / Shared',
        'success',
        'pull-panel',
      )}
    </div>

    <!-- Sidebar: metrics + callouts -->
    <aside class="flex min-h-0 flex-col gap-4 overflow-y-auto xl:col-span-1">
      <SprintMetrics
        pushMetrics={sim.pushMetrics}
        pullMetrics={sim.pullMetrics}
        isComplete={sim.isComplete}
      />
      <SprintCallouts
        pushMetrics={sim.pushMetrics}
        pullMetrics={sim.pullMetrics}
        isRunning={sim.isRunning}
        isComplete={sim.isComplete}
      />
    </aside>
  </div>
</main>
