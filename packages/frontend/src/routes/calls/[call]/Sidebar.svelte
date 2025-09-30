<script lang="ts">
    import type { CallDto } from "itam-edu-api/src/calls/dao";
    import type { ParticipantState, RoomState } from "./state.svelte";
    import type { User } from "itam-edu-common";
    import type { CallJoinData, CoursePartial } from "$lib/types";
    import api from "$lib/api";
    import { getToaster } from "$lib/Toaster.svelte";
    import { goto } from "$app/navigation";
    import { coursePath } from "$lib/path";

    let {
        courses,
        call,
        room,
        focus = $bindable(null),
        tab = $bindable(),
        joinData,
        onClose
    }: Props = $props();
    type Props = {
        user: User | null;
        courses: CoursePartial[];
        call: CallDto;
        room: RoomState;
        focus: ParticipantState | null;
        tab: "people" | "chat" | "settings";
        joinData: CallJoinData;
        onClose: () => void;
    };
    const toaster = getToaster();

    const endCall = async () => {
        if (
            !confirm(
                "Вы точно хотите завершить звонок? Его нельзя будет начать снова."
            )
        ) {
            return;
        }

        const resp = await api({ fetch }).calls({ call: call.id }).stop.post();
        if (resp.error) {
            toaster.add("Не удалось остановить звонок", "error");
            return;
        }

        const course = courses.find(c => c.id === call.courseId);
        if (course === undefined) {
            await goto("/");
        } else {
            await goto(coursePath(course));
        }
    };
</script>

<aside
    class={[
        "w-80 2xl:w-100 shrink-0",
        "hidden md:flex flex-col overflow-y-auto",
        "bg-surface"
    ]}
>
    <header
        class={[
            "flex justify-between items-center h-15 px-4",
            "text-on-surface-contrast bg-surface-dimmed",
            "border-b border-surface-border"
        ]}
    >
        {#if tab === "people"}
            <h4>Участники ({room.remoteParticipants.length + 1})</h4>
        {:else if tab === "chat"}
            <h4>Чат</h4>
        {:else if tab === "settings"}
            <h4>Настройки</h4>
        {/if}
        <button
            class={[
                "p-2 rounded-full bg-surface-dimmed hover:bg-surface",
                "duration-100 transition-colors"
            ]}
            title="Закрыть меню"
            aria-label="Закрыть меню"
            onclick={onClose}
        >
            <i class="ph ph-x"></i>
        </button>
    </header>
    {#if tab === "people"}
        {@render peopleTab()}
    {:else if tab === "chat"}
        {@render chatTab()}
    {:else if tab === "settings"}
        {@render settingsTab()}
    {/if}
    <nav class="flex h-15 shrink-0 border-t border-surface-border">
        <button
            class={[
                "flex-1 flex justify-center items-center",
                tab === "people" ? "bg-surface" : "bg-surface-dimmed",
                "text-on-surface hover:bg-surface transition-colors duration-100"
            ]}
            title="Участники"
            aria-label="Участники"
            onclick={() => (tab = "people")}
        >
            <i class="ph ph-users-three text-[25px]"></i>
        </button>
        <button
            class={[
                "flex-1 flex justify-center items-center",
                tab === "chat" ? "bg-surface" : "bg-surface-dimmed",
                "text-on-surface hover:bg-surface transition-colors duration-100"
            ]}
            title="Чат"
            aria-label="Чат"
            onclick={() => (tab = "chat")}
        >
            <i class="ph ph-chats text-[25px]"></i>
        </button>
        {#if joinData.permissions.isAdmin}
            <button
                class={[
                    "flex-1 flex justify-center items-center",
                    tab === "settings" ? "bg-surface" : "bg-surface-dimmed",
                    "text-on-surface hover:bg-surface transition-colors duration-100"
                ]}
                title="Настройки"
                aria-label="Настройки"
                onclick={() => (tab = "settings")}
            >
                <i class="ph ph-gear-six text-[25px]"></i>
            </button>
        {/if}
    </nav>
</aside>

{#snippet peopleTab()}
    {@const participants = [
        room.localParticipant,
        ...room.remoteParticipants
    ].sort((a, b) => {
        const rank = (p: typeof a): number => {
            if (p.cameraEnabled || p.screenEnabled) return 0;
            if (p.microphoneEnabled) return 1;
            if (p.identity.startsWith("guest:")) return 1000;
            return 2;
        };
        return rank(a) - rank(b);
    })}
    <ul class="flex-1 shrink-0 flex flex-col overflow-y-auto">
        {#each participants as participant}
            <button
                class={[
                    "shrink-0 flex items-center gap-1 h-10 px-2",
                    focus?.identity !== participant.identity
                        ? "bg-surface"
                        : "bg-surface-tint",
                    "hover:bg-surface-tint transition-colors duration-100"
                ]}
                onclick={() => (focus = participant)}
            >
                <span class="mr-auto">
                    {participant.name}
                    {#if participant === room.localParticipant}
                        <span class="text-on-surface-muted">(вы)</span>
                    {/if}
                </span>
                {#if participant.microphoneEnabled}
                    <i
                        class="ph ph-microphone text-[16px] p-1 text-primary bg-on-primary rounded-full"
                    ></i>
                {/if}
                {#if participant.cameraEnabled}
                    <i
                        class="ph ph-video-camera text-[16px] p-1 text-primary bg-on-primary rounded-full"
                    ></i>
                {/if}
                {#if participant.screenEnabled}
                    <i
                        class="ph ph-monitor-arrow-up text-[16px] p-1 text-primary bg-on-primary rounded-full"
                    ></i>
                {/if}
            </button>
        {/each}
    </ul>
{/snippet}
{#snippet chatTab()}
    <div class="flex-1 shrink-0 flex flex-col overflow-y-auto">
        Under construction!
    </div>
{/snippet}
{#snippet settingsTab()}
    <div class="flex-1 shrink-0 flex flex-col overflow-y-auto p-4">
        <button class="btn mt-auto" onclick={endCall}>Завершить звонок</button>
    </div>
{/snippet}
