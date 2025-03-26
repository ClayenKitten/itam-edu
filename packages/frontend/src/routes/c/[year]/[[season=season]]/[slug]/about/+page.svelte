<script lang="ts">
    import { invalidate } from "$app/navigation";
    import EditButton from "$lib/components/EditButton.svelte";
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

<div class="flex flex-col w-full max-w-[1200px] mx-auto h-full p-10 gap-3.5">
    <div
        class="banner basis-[191px] shrink-0 mb-5 rounded-lg overflow-hidden"
        aria-hidden="true"
    >
        {#if data.course.banner}
            <img
                src={data.course.banner}
                alt=""
                class="w-full h-full object-cover object-center"
            />
        {/if}
    </div>
    <header class="flex gap-4">
        <h2>{data.course.title}</h2>
        {#if canEdit && !editing}
            <EditButton onclick={() => (editing = true)} />
        {/if}
    </header>
    <TipTap bind:content={data.course.about} readonly={!editing} />
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

<style>
    .banner {
        background: linear-gradient(
            -20deg,
            var(--color-primary),
            var(--color-on-primary)
        );
    }
</style>
