<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    let { data } = $props();
</script>

<div id="wrapper" class="flex flex-col bg-background">
    <Header
        user={data.user}
        notifications={data.notifications}
        courses={data.courses}
        standalone
    />
    <main class="flex flex-col py-12.5 px-7.5 gap-7.5">
        <h2>Календарь</h2>
        <p class="text-lg-medium">В разработке! 🚧</p>
    </main>
</div>
