<script lang="ts">
    import WindowManager from "$lib/windows/WindowManager.svelte";
    import "../app.css";

    let { children } = $props();
</script>

<svelte:head>
    <!-- Default title just in case -->
    <title>ITAM Education</title>
</svelte:head>

{@render children()}
<WindowManager />
