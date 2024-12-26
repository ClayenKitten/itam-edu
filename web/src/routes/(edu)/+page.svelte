<script lang="ts">
    import { coursePath } from "$lib/path.js";

    const { data } = $props();
</script>

<div class="flex h-full p-4 gap-4 bg-amber-50">
    <div
        class="flex flex-col w-72 h-full p-4 bg-slate-200 border-slate-900 border rounded-sm"
    >
        <h1 class="text-lg font-bold">Courses</h1>
        {#each data.courses as course, i}
            <span>
                {i + 1}.
                <a class="underline" href={coursePath(course)}>
                    {course.title}
                </a>
            </span>
        {/each}
    </div>
</div>
