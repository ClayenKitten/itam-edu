<script lang="ts">
    const { data } = $props();
</script>

<header class="flex justify-between items-center h-20">
    <h1 class="text-2xl text-text font-bold">Courses</h1>
</header>
<menu>
    <button
        class="h-10 px-7 text-text text-sm bg-success hover:bg-success-light rounded-sm"
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
                    <div class="flex-1"></div>
                    <div class="flex gap-2.5">
                        {#if course.public}
                            <div
                                title="Public"
                                class="flex justify-center items-center bg-surface-light w-8 h-8 rounded-sm"
                            >
                                <i class="ph ph-eye text-xl"></i>
                            </div>
                        {:else}
                            <div
                                title="Not Public"
                                class="flex justify-center items-center bg-surface-light w-8 h-8 rounded-sm"
                            >
                                <i class="ph ph-eye-slash text-xl"></i>
                            </div>
                        {/if}
                        {#if course.archived}
                            <div
                                title="Archived"
                                class="flex justify-center items-center bg-surface-light w-8 h-8 rounded-sm"
                            >
                                <i class="ph ph-archive text-xl"></i>
                            </div>
                        {/if}
                    </div>
                </header>
                <hr class="border-surface-light" />
                <div class="contents text-text break-all">
                    {#if course.description}
                        <span class="flex-1 px-6 py-3">
                            {course.description}
                        </span>
                    {:else}
                        <span class="flex-1 px-6 py-3 text-text-opaque italic">
                            No description
                        </span>
                    {/if}
                </div>
                <ul class="flex flex-col gap-2 py-3 text-text break-all">
                    <li class="px-6">
                        <span class="text-text-opaque">Students:&nbsp;</span>
                        <span class="text-text">{course.studentsCount}</span>
                    </li>
                    <li class="px-6">
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
