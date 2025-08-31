<script lang="ts">
    import { page } from "$app/state";
    import "../app.css";

    let { children } = $props();

    let metadata = $derived(page.data);
</script>

<svelte:head>
    <!-- Main -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content={page.url.toString()} />
    <meta name="application-name" content="ITAM Education" />
    <meta property="og:site_name" content="ITAM Education" />
    <!-- Title -->
    <title>{metadata.title}</title>
    <meta property="og:title" content={metadata.title} />
    <!-- Description -->
    <meta name="description" content={metadata.description} />
    <meta property="og:description" content={metadata.description} />
    <!-- Favicon -->
    <link rel="icon" href={metadata.favicon} />
    <!-- Image -->
    {#if metadata.pageImage}
        <meta property="og:image" content={metadata.pageImage.url} />
        <meta
            property="og:image:width"
            content={`${metadata.pageImage.width}`}
        />
        <meta
            property="og:image:height"
            content={`${metadata.pageImage.height}`}
        />
        <meta name="twitter:image" content={metadata.pageImage.url} />
        <meta name="twitter:card" content="summary_large_image" />
    {/if}
</svelte:head>

{@render children()}
