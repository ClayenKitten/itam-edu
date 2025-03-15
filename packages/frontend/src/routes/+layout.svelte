<script lang="ts">
    import WindowManager from "$lib/windows/WindowManager.svelte";
    import "../app.css";

    let { children } = $props();
</script>

{@render children()}
<WindowManager />
