<script lang="ts">
    import IconButton from "$lib/components/IconButton.svelte";
    import { coursePath, filePath } from "$lib/path";
    import { getPrompter } from "$lib/Prompter.svelte";
    import { getToaster } from "$lib/Toaster.svelte";
    import type { Call } from "$lib/types";
    import {
        differenceInMinutes,
        format as formatDate,
        formatDuration
    } from "date-fns";
    import { ru } from "date-fns/locale";
    import NewCallPrompt from "./NewCallPrompt.svelte";
    import api from "$lib/api";
    import { goto } from "$app/navigation";

    let { data } = $props();
    const toaster = getToaster();
    const prompter = getPrompter();

    const ongoingCalls = $derived(
        data.calls.filter(c => c.startedAt !== null && c.endedAt === null)
    );
    const completedCalls = $derived(data.calls.filter(c => c.endedAt !== null));
</script>

<svelte:head>
    <title>Звонки | {data.course.title}</title>
</svelte:head>

<div
    class={[
        "flex flex-col h-full m-10 gap-6",
        "max-w-[1100px] @min-[1200px]/main:mx-40"
    ]}
>
    <header class="flex gap-4">
        <h2>Звонки</h2>
        <IconButton
            icon="ph-plus"
            title="Начать новый звонок"
            onclick={async () => {
                const result = await prompter.show(NewCallPrompt, {
                    lessons: data.lessons
                });
                if (!result) return;

                const response = await api({ fetch })
                    .courses({ course: data.course.id })
                    .calls.post(result);
                if (response.error) {
                    toaster.add("Не удалось начать звонок", "error");
                    return;
                }
                await goto(`/calls/${response.data.id}`);
            }}
        />
    </header>
    {#if ongoingCalls.length > 0}
        <section class="flex flex-wrap gap-6">
            {#each ongoingCalls as call (call.id)}
                {@render OngoingCallCard(call)}
            {/each}
        </section>
    {/if}
    {#if completedCalls.length > 0}
        <section class="flex flex-col gap-4">
            <h4 class="mt-4">Прошедшие звонки</h4>
            <div
                class={[
                    "grid gap-y-1 gap-x-12 items-center",
                    "grid-cols-[minmax(min-content,400px)_minmax(200px,1fr)_minmax(min-content,max-content)]",
                    "p-6 bg-surface rounded-lg shadow",
                    "text-lg-regular text-on-surface"
                ]}
            >
                <header class="contents text-md-medium text-on-surface-muted">
                    {#each ["Название", "Урок", "Дата", ""] as title}
                        <div>{title}</div>
                    {/each}
                </header>
                <hr class="border-surface-border my-1 col-span-full" />
                {#each completedCalls as call (call.id)}
                    {@const lesson = data.lessons.find(l => l.id === call.id)}
                    {@const durationMin = differenceInMinutes(
                        call.endedAt!,
                        call.startedAt!
                    )}
                    <div class="p-1">{call.title}</div>
                    {#if lesson}
                        <a
                            class="text-primary hover:underline p-1"
                            href={`${coursePath(data.course)}/lessons/${lesson.id}`}
                        >
                            {lesson.title}
                        </a>
                    {:else}
                        <div class="p-1">-</div>
                    {/if}
                    <div class="p-1">
                        {formatDate(call.startedAt!, "dd.MM.yyyy")},
                        {formatDate(
                            call.startedAt!,
                            "HH:mm"
                        )}&MediumSpace;-&MediumSpace;{formatDate(
                            call.endedAt!,
                            "HH:mm"
                        )}
                        ({formatDuration(
                            {
                                hours: Math.floor(durationMin / 60),
                                minutes: durationMin % 60
                            },
                            { locale: ru }
                        )})
                    </div>
                {/each}
            </div>
        </section>
    {/if}
    {#if data.calls.length === 0}
        <div class="mt-[25dvh] mx-auto flex flex-col items-center gap-1">
            <h4 class="text-on-surface-contrast">Звонков ещё нет 🤙</h4>
            <span class="text-lg-regular text-on-surface-muted text-center">
                Вы можете начать звонок через кнопку "+" наверху<br />
                страницы или со страницы урока.
            </span>
        </div>
    {/if}
</div>

{#snippet OngoingCallCard(call: Call)}
    <article
        class={[
            "flex flex-col items-start gap-4",
            "w-[356px] p-3 pb-4",
            "bg-surface rounded-md shadow"
        ]}
    >
        <header class="flex flex-col gap-1 break-all">
            <h4>{call.title}</h4>
            <p class="text-md-regular text-on-surface-muted">
                Идёт с {formatDate(call.startedAt!, "dd.MM.yyyy HH:mm")}
            </p>
        </header>
        <a class="relative w-[356px]" href={`/calls/${call.id}`}>
            {#if call.cover}
                <img
                    class="w-[330px] h-[220px] object-cover rounded-xs"
                    src={filePath(call.cover)}
                    alt=""
                />
            {:else}
                <div
                    class={[
                        "w-[330px] h-[220px] bg-on-primary object-cover rounded-xs"
                    ]}
                ></div>
            {/if}
        </a>
    </article>
{/snippet}
