<script lang="ts">
    const { data } = $props();

    const canEdit = $derived(
        data.permissions?.course?.[data.course.id]?.canEditInfo ?? false
    );
</script>

<section class="flex flex-col gap-8 p-6 text-text bg-surface lg:rounded">
    <header class="flex items-center gap-2.5">
        <i class="ph-fill ph-book text-2xl"></i>
        <h1 class="text-2xl font-bold">About</h1>
    </header>
    <hr class="-mx-6 -mt-2 border-surface-light" />
    <article class="flex flex-col">
        <textarea class="min-h-80" value={data.readme} readonly={!canEdit}
        ></textarea>
    </article>
</section>
