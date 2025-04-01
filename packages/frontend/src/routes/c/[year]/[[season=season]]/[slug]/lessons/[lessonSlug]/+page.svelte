<script lang="ts">
    import { invalidate } from "$app/navigation";
    import EditButton from "$lib/components/EditButton.svelte";
    import TipTap from "$lib/components/TipTap.svelte";

    let { data } = $props();

    let editing = $state(false);

    const canEdit =
        data.permissions?.course.find(x => x.courseId === data.course.id)
            ?.permissions.canEditContent === true;

    async function save() {
        // TODO
    }
</script>

<div class="flex flex-col h-full p-10 gap-7">
    <header class="flex gap-8">
        <h2>{data.lesson.title}</h2>
        {#if canEdit && !editing}
            <EditButton onclick={() => (editing = true)} />
        {/if}
    </header>
    <TipTap bind:content={data.lesson.content} readonly={!editing} />
    {#if editing}
        <footer class="flex gap-4">
            <button
                class="btn text-primary bg-on-primary"
                onclick={async () => {
                    editing = false;
                    await invalidate("app:lesson");
                }}
            >
                Отменить
            </button>
            <button
                class="btn"
                onclick={async () => {
                    editing = false;
                    await save();
                    await invalidate("app:lesson");
                }}
            >
                Сохранить
            </button>
        </footer>
    {/if}
</div>
