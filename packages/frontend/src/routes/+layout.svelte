<script lang="ts">
    import { page } from "$app/state";
    import Toaster, { createToaster } from "$lib/Toaster.svelte";
    import Prompter, { createPrompter } from "$lib/Prompter.svelte";
    import "../app.css";

    let { data, children } = $props();

    let metadata = $derived(page.data);
    const toaster = createToaster();
    const prompter = createPrompter();

    const enableTracking = $derived(!page.url.hostname.includes("localhost"));
    $effect(() => {
        if (enableTracking && data.user) {
            (window as any).umami.identify(data.user.id, {
                name: data.user.displayName,
                telegram: data.user.telegram.username
            });
        }
    });
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
    {#if enableTracking}
        <script
            defer
            src="https://cloud.umami.is/script.js"
            data-website-id="9f2248b2-2fd4-4dbd-9fc0-1515f1feab90"
            data-domains="edu.itatmisis.ru"
        ></script>
    {/if}
</svelte:head>

<Toaster {toaster} />
<Prompter {prompter} />

{@render children()}
