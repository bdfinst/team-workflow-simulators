<script>
  import '../app.css'

  let { children } = $props()
</script>

<svelte:head>
  <title>Team Workflow Simulators</title>
</svelte:head>

{@render children()}
