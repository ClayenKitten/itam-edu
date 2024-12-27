<script lang="ts">
    import { coursePath } from "$lib/path.js";

    const { data, children } = $props();
</script>

<div class="flex h-full p-4 gap-4 bg-amber-50">
    <nav
        class="flex flex-col w-72 p-4 bg-slate-200 border-slate-500 border rounded-sm"
    >
        <h1 class="text-lg font-bold">Lessons</h1>
        {#each data.lessons as lesson, i}
            <span>
                {i + 1}.
                <a
                    class="underline"
                    href={coursePath(data.course) + "/" + lesson.slug}
                >
                    {lesson.title}
                </a>
            </span>
        {/each}
    </nav>
    <article
        class="flex flex-col flex-1 p-4 bg-slate-200 border-slate-500 border rounded-sm"
    >
        {@render children()}
    </article>
</div>
