<!--
    @component
    A small banner that displays information about related call.

    It is displayed 30 minutes before the lesson and 2 hours after the call ended.
 -->

<script lang="ts">
    import { goto } from "$app/navigation";
    import api from "$lib/api";
    import { getToaster } from "$lib/Toaster.svelte";
    import type { LessonPartial } from "$lib/types";
    import type { CallDto } from "itam-edu-api/src/calls/dao";
    import { onMount } from "svelte";

    const { lesson }: Props = $props();
    type Props = {
        lesson: LessonPartial;
    };
    const toaster = getToaster();

    let call: CallDto | null = $state(null);

    let currentDate = $state(new Date());
    const timerText = $derived.by(() => {
        if (!lesson.schedule) return "";
        const diffMs = lesson.schedule.date.getTime() - currentDate.getTime();
        if (diffMs < 0) return "Совсем скоро...";
        const diffMinutes = diffMs / 60000;
        const diffSeconds = (diffMs / 1000) % 60;
        return [
            Math.floor(diffMinutes).toFixed(0).padStart(2, "0"),
            Math.floor(diffSeconds).toFixed(0).padStart(2, "0")
        ].join(":");
    });
    const halfHour = 30 * 60 * 1000;
    const twoHour = 120 * 60 * 1000;

    const enabled = $derived.by(() => {
        if (lesson.schedule?.isOnline !== true) return false;

        const now = currentDate.getTime();
        const start = lesson.schedule.date.getTime();
        const showFrom = start - halfHour;

        if (call !== null) {
            if (call.endedAt !== null) {
                const end = call.endedAt.getTime();
                return now >= showFrom && now <= end + twoHour;
            } else {
                return true;
            }
        } else {
            return now >= showFrom && now <= start + twoHour;
        }
    });

    onMount(() => {
        if (!enabled) return;
        if (call !== null) return;
        const refetchCall = async () => {
            try {
                const response = await api({ fetch })
                    .calls({ call: lesson.id })
                    .get();
                if (response.status === 404) {
                    call = null;
                    return;
                }
                if (response.error) {
                    toaster.add(
                        "Не удалось получить информацию о звонке",
                        "error"
                    );
                }
                call = response.data;
            } catch (e) {
                console.error(`Failed to get call information: ${e}`);
            }
        };

        const timer = setInterval(() => {
            currentDate = new Date();
        }, 1000);
        const callFetchInterval = setInterval(refetchCall, 10000);
        refetchCall();
        return () => {
            clearInterval(timer);
            clearInterval(callFetchInterval);
        };
    });
</script>

{#if enabled}
    {#if call && call.endedAt === null}
        {@render banner("Трансляция началась", "Подключайтесь!", {
            text: "Подключиться",
            disabled: false
        })}
    {:else if call && call.endedAt}
        {@render banner("Трансляция завершилась", "Спасибо, что были с нами!")}
    {:else}
        {@render banner(
            "Трансляция скоро начнётся",
            "Ждём начала трансляции преподавателем.",
            { text: timerText, disabled: true }
        )}
    {/if}
{/if}

{#snippet banner(
    header: string,
    text: string,
    button?: { text: string; disabled: boolean }
)}
    <section
        class={[
            "flex items-center px-6 py-4",
            "bg-surface border shadow",
            "border-surface-border rounded-md"
        ]}
    >
        <div class="flex-1 flex flex-col gap-1">
            <h5>{header}</h5>
            <p class="text-md-regular text-on-surface-muted">
                {text}
            </p>
        </div>
        {#if button}
            <button
                class="btn"
                disabled={button.disabled}
                onclick={async () => {
                    if (call === null) return;
                    await goto(`/calls/${call.id}`);
                }}
            >
                {button.text}
            </button>
        {/if}
    </section>
{/snippet}
