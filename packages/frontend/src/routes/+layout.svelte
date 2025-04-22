<script lang="ts">
    import "../app.css";

    let { children } = $props();
</script>

<svelte:head>
    <title>ITAM Education</title>
    <meta name="description" content="Образовательная платформа ITAM" />
    <meta property="og:site_name" content="ITAM Education" />
    <meta property="og:description" content="Образовательная платформа ITAM" />
</svelte:head>

{@render children()}
