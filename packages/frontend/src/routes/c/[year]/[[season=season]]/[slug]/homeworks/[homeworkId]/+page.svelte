<script lang="ts">
    import { goto, invalidate } from "$app/navigation";
    import api from "$lib/api.js";
    import IconButton from "$lib/components/IconButton.svelte";
    import TipTap from "$lib/components/TipTap.svelte";
    import { coursePath } from "$lib/path.js";
    import { format as formatDate } from "date-fns";

    let { data } = $props();

    const canEdit =
        data.permissions?.course.find(x => x.courseId === data.course.id)
            ?.permissions.canEditContent === true;
    const canReview =
        data.permissions?.course.find(x => x.courseId === data.course.id)
            ?.permissions.canManageSubmissions === true;
    const isStudent = data.enrollments?.some(
        e => e.courseId === data.course.id
    );

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
            <h4 class="text-on-surface-muted">
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
