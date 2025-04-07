<script lang="ts">
    import { goto } from "$app/navigation";
    import IconButton from "$lib/components/IconButton.svelte";
    import TipTap from "$lib/components/TipTap.svelte";
    import { coursePath } from "$lib/path.js";
    import { format as formatDate } from "date-fns";

    let { data } = $props();

    const canEdit =
        data.permissions?.course.find(x => x.courseId === data.course.id)
            ?.permissions.canEditContent === true;

    async function save() {
        // TODO
    }
</script>

<div
    class={[
        "flex flex-col h-full p-10 gap-7",
        "max-w-[1000px] mx-10 @min-[1200px]/main:mx-40"
    ]}
>
    <section
        class="relative flex flex-col gap-7.5 px-6 py-5.5 rounded-xl bg-surface shadow"
    >
        <a
            class="flex items-center h-min gap-2 text-h4 text-primary"
            href="{coursePath(data.course)}/homeworks"
        >
            <i class="ph ph-caret-left text-[16px]"></i>
            Назад
        </a>
        <header class="flex flex-col gap-2">
            <h2>{data.homework.title}</h2>
            <h4>
                {#if data.homework.deadline}
                    До
                    {formatDate(data.homework.deadline, "dd.MM.yy / HH:mm")}
                {:else}
                    Без дедлайна
                {/if}
            </h4>
            {#if canEdit}
                <div class="absolute top-5.5 right-6">
                    <IconButton
                        icon="ph-pencil-simple"
                        title="Редактировать"
                        onclick={() => {
                            goto(
                                `${coursePath(data.course)}/homeworks/${data.homework.id}/edit`
                            );
                        }}
                    />
                </div>
            {/if}
        </header>
        <article>
            <TipTap content={data.homework.content} readonly />
        </article>
        {#if data.homework.lessons.length > 0}
            <footer class="flex gap-3">
                {#each data.homework.lessons as lesson}
                    <a
                        class={[
                            "flex items-center gap-2.5 w-min h-10 px-5 text-nowrap",
                            "text-primary text-button bg-on-primary rounded-2xs"
                        ]}
                        href="{coursePath(data.course)}/lessons/{lesson.id}"
                        target="_blank"
                    >
                        {lesson.title}
                        <i class="ph ph-arrow-square-out text-[18px]"></i>
                    </a>
                {/each}
            </footer>
        {/if}
    </section>
    <section class="grow-1 flex flex-col"></section>
    <label
        class={[
            "flex items-center gap-3 w-full h-15 py-1 px-5 text-comment text-on-surface-muted",
            "bg-surface border border-on-primary focus-within:border-primary rounded-sm shadow"
        ]}
    >
        <input
            class="h-full w-full outline-0"
            placeholder="Напишите сообщение..."
        />
        <button
            class="group h-7 w-7 outline-0"
            aria-label="Отправить"
            title="Отправить"
        >
            <i
                class="group-hover:hidden group-focus:hidden ph ph-paper-plane-right text-[28px] text-primary"
            ></i>
            <i
                class="not-group-hover:not-group-focus:hidden ph-fill ph-paper-plane-right text-[28px] text-primary"
            ></i>
        </button>
    </label>
</div>
