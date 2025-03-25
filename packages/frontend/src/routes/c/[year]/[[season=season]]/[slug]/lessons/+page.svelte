<script lang="ts">
    import LessonCard from "$lib/components/LessonCard.svelte";

    let { data } = $props();
</script>

<div class="flex flex-col gap-10 p-10">
    <header class="flex">
        <h2>Занятия</h2>
    </header>
    <div
        class={[
            "grid gap-x-4 gap-y-5 gap-2.5",
            "grid-cols-[repeat(auto-fit,343px)]"
        ]}
    >
        {#each data.lessons.toReversed() as lesson, i}
            <LessonCard
                course={data.course}
                position={data.lessons.length - i}
                {lesson}
            />
        {/each}
    </div>
</div>
