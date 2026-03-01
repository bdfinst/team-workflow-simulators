<script>
  let { text } = $props()
</script>

<span class="group relative ml-1 inline-flex cursor-help items-center">
  <svg
    class="h-3 w-3 text-surface-500 transition-colors group-hover:text-accent-cyan group-focus-within:text-accent-cyan"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    stroke-width="2"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <path stroke-linecap="round" d="M12 16v-4m0-4h.01" />
  </svg>
  <span
    role="tooltip"
    class="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-[200px] -translate-x-1/2 scale-95 rounded bg-surface-700 px-2 py-1.5 text-[10px] leading-tight text-surface-200 opacity-0 shadow-lg transition-all duration-150 group-hover:scale-100 group-hover:opacity-100 group-focus-within:scale-100 group-focus-within:opacity-100"
  >
    {text}
    <span
      class="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-surface-700"
      aria-hidden="true"
    ></span>
  </span>
</span>
