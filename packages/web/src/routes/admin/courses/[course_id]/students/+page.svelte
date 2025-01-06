<script lang="ts">
    const { data } = $props();
</script>

<section class="bg-surface rounded">
    <header class="flex justify-end max-sm:px-3 p-6 pb-5">
        <label
            class="input group flex items-center gap-2 flex-1 sm:flex-[0_0_280px] h-10 p-2.5 bg-surface-light rounded-sm"
        >
            <i
                class="ph ph-magnifying-glass text-base text-text-opaque group-focus-within:text-text"
            ></i>
            <input
                placeholder="Search students..."
                class="text-text text-sm placeholder:text-text-opaque p-0 bg-transparent border-0 outline-0 focus:ring-0"
            />
        </label>
    </header>
    <article
        class="grid grid-cols-[repeat(3,_minmax(min-content,_1fr))] overflow-x-auto"
    >
        <hr class="col-span-full border-surface-light" />
        <div class="text-xs text-text-opaque font-bold px-6 py-2.5">Name</div>
        <div class="text-xs text-text-opaque font-bold px-6 py-2.5">
            Telegram
        </div>
        <div class="text-xs text-text-opaque font-bold px-6 py-2.5">Email</div>
        {#each data.students as student}
            <hr class="col-span-full border-surface-light" />
            <div class="flex items-center gap-3 h-20 px-6 text-text">
                {#if student.avatar}
                    <img
                        class="w-10 h-10 rounded-full"
                        src={student.avatar}
                        alt=""
                    />
                {:else}
                    <div class="w-10 h-10"></div>
                {/if}
                <a
                    href={`https://t.me/${student.tgUsername}`}
                    target="_blank"
                    class="flex items-center gap-1 hover:border-b hover:mb-[-1px]"
                >
                    <span>@{student.tgUsername}</span>
                    <i class="ph ph-link-simple"></i>
                </a>
            </div>
            <div class="flex items-center h-20 px-6 text-text">
                <span>{[student.lastName, student.firstName].join(" ")}</span>
            </div>
            <div class="flex items-center h-20 px-6 text-text">
                {student.email}
            </div>
        {:else}
            <hr class="col-span-full border-surface-light" />
            <div class="flex justify-center p-8 text-text col-span-full">
                No students yet!
            </div>
        {/each}
    </article>
</section>
