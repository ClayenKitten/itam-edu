<script lang="ts">
    import "../app.css";

    let { children } = $props();
</script>

<svelte:head>
    <!-- Default title just in case -->
    <title>ITAM Education</title>
    <meta property="og:site_name" content="ITAM Education" />
</svelte:head>

{@render children()}
