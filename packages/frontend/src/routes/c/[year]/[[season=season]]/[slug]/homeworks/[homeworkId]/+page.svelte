<script lang="ts">
    import { goto, invalidate, onNavigate } from "$app/navigation";
    import { page } from "$app/state";
    import api from "$lib/api.js";
    import IconButton from "$lib/components/IconButton.svelte";
    import TipTap from "$lib/components/TipTap.svelte";
    import { coursePath } from "$lib/path.js";
    import { format as formatDate } from "date-fns";
    import { getContext, type Snippet } from "svelte";

    let { data } = $props();

    const canEdit = $derived(
        data.user?.hasCoursePermission(data.course.id, "canEditContent") ===
            true
    );
    const canReview = $derived(
        data.user?.hasCoursePermission(
            data.course.id,
            "canManageSubmissions"
        ) === true
    );
    const isStudent = $derived(data.user?.isCourseStudent(data.course.id));

    async function sendMessage() {
        if (!data.submission) return;
        const response = await api({ fetch })
            .courses({ course: data.course.id })
            .submissions({
                homework: data.homework.id
            })({ student: data.submission.studentId })
            .post({
                content: newMessageText,
                accepted: isStudent ? null : newMessageAccepted
            });
        if (response.error) alert(response.error.status);
        else {
            newMessageText = "";
            await invalidate("app:submission");
            await invalidate("app:submissions");
        }
    }
    let newMessageText = $state("");
    let newMessageAccepted = $state(true);

    let layout = getContext<{ additionalSidebar: Snippet | null }>("layout");
    $effect(() => {
        if (canReview) {
            layout.additionalSidebar = additionalSidebar;
        } else {
            layout.additionalSidebar = null;
        }
    });
    onNavigate(({ to }) => {
        if (to && to.route.id !== page.route.id) {
            layout.additionalSidebar = null;
        }
    });
</script>

<svelte:head>
    <title>{data.homework.title} | {data.course.title}</title>
</svelte:head>

<div
    class={[
        "flex flex-col h-full m-10 gap-7 max-w-[1000px]",
        canReview ? "mx-10" : "mx-10 @min-[1200px]/main:mx-40"
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
            <h4 class="text-on-surface-muted">
                {#if data.homework.deadline}
                    До
                    {formatDate(data.homework.deadline, "dd.MM HH:mm")}
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
                            "text-primary text-button bg-on-primary rounded-2xs",
                            "border border-on-primary hover:border-primary transition-colors duration-100"
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
    {#if (isStudent || canReview) && data.submission}
        <section class="grow-1 flex flex-col-reverse gap-7.5">
            {#each data.submission.messages.toReversed() as message}
                {@const user =
                    message.userId === null
                        ? null
                        : (data.submission.users.find(
                              u => u.id === message.userId
                          ) ?? null)}
                {#if user}
                    <li
                        class={[
                            "relative flex flex-col gap-5 py-5.5 px-6.5 w-[min(100%,600px)]",
                            "rounded-xl shadow first-of-type:mb-auto",
                            (user.id === data.submission.studentId) !==
                            isStudent
                                ? "self-end bg-surface"
                                : "self-start bg-on-primary"
                        ]}
                    >
                        {#if message.accepted !== null}
                            <div
                                class={[
                                    "absolute top-[calc(50%-16px)] ",
                                    isStudent ? "-left-4" : "-right-4"
                                ]}
                            >
                                {@render acceptedIcon(message.accepted)}
                            </div>
                        {/if}
                        <header class="flex items-center gap-3">
                            <div
                                class="flex justify-center items-center h-10 w-10 bg-primary rounded-xs"
                            >
                                {#if user.avatar}
                                    <img
                                        class="rounded-xs"
                                        src={user.avatar}
                                        alt=""
                                    />
                                {:else}
                                    <span class="text-on-primary text-comment">
                                        {user.tgUsername[0]}
                                    </span>
                                {/if}
                            </div>
                            <span>
                                {#if !user.firstName && !user.lastName}
                                    {user.tgUsername}
                                {:else}
                                    {user.firstName}
                                    {user.lastName}
                                {/if}
                            </span>
                        </header>
                        <div class="shrink-0 break-words text-balance">
                            {message.content}
                        </div>
                        <footer class="text-date text-on-surface-muted">
                            {formatDate(message.sentAt, "dd.MM.yy HH:mm")}
                        </footer>
                    </li>
                {/if}
            {/each}
        </section>
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <label
            class={[
                "flex items-center gap-3 w-full min-h-15 px-5 text-comment text-on-surface-muted",
                "bg-surface border border-on-primary focus-within:border-primary rounded-sm shadow"
            ]}
            onkeydown={e => {
                if (newMessageText.length === 0) return;
                if (e.key !== "Enter") return;
                sendMessage();
            }}
        >
            <input
                class="grow-1 text-on-surface-contrast h-full outline-0"
                bind:value={newMessageText}
                placeholder="Напишите сообщение..."
            />
            {#if canReview}
                <button
                    onclick={() => (newMessageAccepted = !newMessageAccepted)}
                >
                    {@render acceptedIcon(newMessageAccepted)}
                </button>
            {/if}
            <button
                class="group h-7 w-7 outline-0"
                aria-label="Отправить"
                title="Отправить"
                disabled={newMessageText.length === 0}
                onclick={sendMessage}
            >
                <i
                    class="group-hover:hidden group-focus:hidden ph ph-paper-plane-right text-[28px] text-primary"
                ></i>
                <i
                    class="not-group-hover:not-group-focus:hidden ph-fill ph-paper-plane-right text-[28px] text-primary"
                ></i>
            </button>
        </label>
    {/if}
</div>

{#snippet acceptedIcon(accepted: boolean)}
    <i
        class={[
            "flex justify-center items-center h-8 w-8 rounded-full",
            accepted
                ? "ph ph-thumbs-up bg-[#469c3c] text-[white]"
                : "ph ph-thumbs-down bg-[#c94634] text-[white]"
        ]}
    ></i>
{/snippet}

{#snippet additionalSidebar()}
    <header class="sticky top-0 flex flex-col gap-4 px-4 pb-4 pt-7 bg-surface">
        <h3>Ответы на задания</h3>
        <input class="input text-date h-9 rounded-xs" placeholder="Поиск..." />
    </header>
    <nav class="flex flex-col gap-2 m-4">
        {#each data.submissions ?? [] as submission}
            {@const unread = submission.accepted === null}
            {@const active =
                submission.homework.id === data.homework.id &&
                submission.student.id === data.submission?.studentId}
            <li
                class={[
                    "flex flex-col gap-3 p-3 border border-on-primary rounded-md",
                    active ? "bg-on-primary" : "",
                    unread ? "border-primary" : ""
                ]}
            >
                <header class="flex gap-3">
                    <img
                        class="h-8 w-8 rounded-2xs"
                        src={submission.student.avatar}
                        alt=""
                    />
                    <div
                        class="flex flex-col overflow-hidden whitespace-nowrap"
                    >
                        <p class="overflow-hidden overflow-ellipsis">
                            {submission.student.firstName}
                            {submission.student.lastName}
                        </p>
                        <a
                            class="text-[12px] text-primary -mt-1 overflow-hidden overflow-ellipsis"
                            href="https://t.me/{submission.student.tgUsername}"
                        >
                            @{submission.student.tgUsername}
                        </a>
                    </div>
                </header>
                <a
                    class={[
                        "flex gap-2 justify-between items-center px-3 py-2.5 ",
                        "text-date bg-on-primary rounded-2xs border border-on-primary",
                        "hover:border-primary transition-colors duration-100",
                        active ? "bg-surface border-surface" : ""
                    ]}
                    href={`${coursePath(data.course)}/homeworks/${submission.homework.id}?student=${submission.student.id}`}
                >
                    {submission.homework.title}
                    <i class="ph ph-caret-right text-[16px]"></i>
                </a>
            </li>
        {/each}
    </nav>
{/snippet}
