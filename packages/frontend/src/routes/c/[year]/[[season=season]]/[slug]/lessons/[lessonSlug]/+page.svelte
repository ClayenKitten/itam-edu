<script lang="ts">
    import { invalidate } from "$app/navigation";
    import TipTap from "$lib/components/TipTap.svelte";

    let { data } = $props();

    let editing = $state(false);

    const canEdit =
        data.permissions?.course.find(x => x.courseId === data.course.id)
            ?.canEditContent === true;

    async function save() {
        // TODO
    }
</script>

<div class="flex flex-col h-full p-10 gap-7">
    <header class="flex gap-8">
        <h2>{data.lesson.title}</h2>
        {#if canEdit && !editing}
            <button
                class="bg-on-primary rounded-full w-11.5 h-11.5"
                onclick={() => {
                    editing = true;
                }}
                aria-label="Редактировать"
            >
                <i class="ph ph-pencil-simple text-primary text-[20px]"></i>
            </button>
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
