<script lang="ts">
    const { data } = $props();
</script>

<header class="flex justify-between items-center h-20">
    <h1 class="text-2xl text-text font-bold">Courses</h1>
</header>
<menu>
    <button
        class="h-10 px-7 text-text text-sm bg-secondary hover:bg-secondary-light rounded-sm"
    >
        <span>Create new course</span>
        <i class="ph ph-plus-circle"></i>
    </button>
</menu>
<section
    class="flex-1 grid grid-cols-[repeat(auto-fill,minmax(max(100%/3-20px,300px),1fr))] auto-rows-auto mt-5 gap-5"
>
    {#each data.courses as course}
        <article class="flex flex-col bg-surface rounded">
            <a class="contents" href={`/admin/courses/${course.id}`}>
                <header
                    class="flex items-center gap-2.5 h-[72px] px-6 text-text text-lg font-bold break-all"
                >
                    <div
                        class="flex justify-center items-center flex-shrink-0 w-[30px] h-[30px] p-1 bg-surface-light rounded-sm"
                    >
                        {#if course.logo}
                            <img src={course.logo} alt="" />
                        {/if}
                    </div>
                    <span>
                        {course.title.substring(0, 80) +
                            (course.title.length > 80 ? "..." : "")}
                    </span>
                </header>
                <hr class="border-surface-light" />
                <ul class="contents text-text break-all">
                    {#if course.description}
                        <li class="flex-1 px-6 py-3">{course.description}</li>
                    {:else}
                        <li class="flex-1 px-6 py-3 text-text-opaque italic">
                            No description
                        </li>
                    {/if}
                    <li class="px-6 py-3">
                        <span class="text-text-opaque">Year:&nbsp;</span>
                        <span class="text-text">{course.year}</span>
                        {#if course.semester}
                            <span class="text-text">
                                &nbsp;({course.semester})
                            </span>
                        {/if}
                    </li>
                </ul>
            </a>
        </article>
    {/each}
</section>
