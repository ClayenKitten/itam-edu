<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import type { Course } from "$lib/types";

    let { data } = $props();
</script>

<div id="wrapper" class="flex flex-col bg-background">
    <Header user={data.user} standalone />
    <main class="flex flex-col py-15 px-7.5 gap-7.5">Профиль</main>
</div>
