<script lang="ts">
    import { getToaster } from "$lib/Toaster.svelte";
    import type { Call, CallJoinData, CoursePartial } from "$lib/types";
    import type { User } from "itam-edu-common";
    import ParticipantVideo from "./ParticipantVideo.svelte";
    import ParticipantAudio from "./ParticipantAudio.svelte";
    import Sidebar from "./Sidebar.svelte";
    import { coursePath } from "$lib/path";
    import { RoomState } from "$lib/calls/room.svelte";
    import { ConnectionState } from "livekit-client";

    let { user, courses, call, joinData, room }: Props = $props();
    type Props = {
        user: User | null;
        courses: CoursePartial[];
        call: Call;
        room: RoomState;
        joinData: CallJoinData;
    };
    const toaster = getToaster();

    let course = $derived(courses.find(c => c.id === call.courseId) ?? null);
    let sidebarTab: "people" | "chat" | "settings" | null = $state(null);

    const disconnect = async () => {
        if (!confirm("Вы уверены, что хотите отключиться?")) {
            return;
        }
        await room.disconnect();
    };

    let isAwaitingApproval = $state(false);
    const onMicrophoneChange = async () => {
        isAwaitingApproval = true;
        try {
            await room.localParticipant.setSourceEnabled(
                "microphone",
                !room.localParticipant.microphoneEnabled
            );
        } catch {
            toaster.add("Не удалось получить доступ к микрофону", "error");
        } finally {
            isAwaitingApproval = false;
        }
    };
    const onCameraChange = async () => {
        isAwaitingApproval = true;
        try {
            await room.localParticipant.setSourceEnabled(
                "camera",
                !room.localParticipant.cameraEnabled
            );
        } catch (e) {
            toaster.add("Не удалось получить доступ к камере", "error");
            console.error(e);
        } finally {
            isAwaitingApproval = false;
        }
    };
    const onScreenChange = async () => {
        isAwaitingApproval = true;
        try {
            await room.localParticipant.setSourceEnabled(
                "screen_share",
                !room.localParticipant.screenEnabled
            );
        } catch (e) {
            toaster.add("Не удалось запустить трансляцию экрана", "error");
            console.error(e);
        } finally {
            isAwaitingApproval = false;
        }
    };
</script>

<svelte:window
    onkeydown={e => {
        if (e.key === "Escape") {
            room.focus = null;
        }
    }}
/>

<div id="wrapper" class="h-dvh flex bg-background">
    <div class="flex-1 flex flex-col gap-4 m-4">
        <header
            class={[
                "flex items-center gap-4 p-4",
                "bg-surface-tint shadow rounded-xs",
                "border border-surface-border"
            ]}
        >
            <h4 class="flex gap-3">
                {call.title}
                {#if course}
                    <span>&bull;</span>
                    <a
                        class="text-primary hover:underline"
                        href={coursePath(course)}
                    >
                        {course.title}
                    </a>
                {/if}
            </h4>
        </header>
        {#key room.focus}
            <main
                class={[
                    "relative flex-1 overflow-hidden",
                    "flex flex-col gap-4 justify-center items-center",
                    "bg-surface shadow rounded-xs"
                ]}
            >
                {#if room.state === ConnectionState.Connecting}
                    Подключаемся...
                {:else if room.state === ConnectionState.Reconnecting || room.state === ConnectionState.SignalReconnecting}
                    Переподключаемся...
                {:else if room.focused !== null}
                    {#if room.focused.screenTrack && !room.focused.screenTrack.isMuted}
                        <div class="size-full overflow-hidden">
                            <ParticipantVideo
                                track={room.focused.screenTrack}
                            />
                        </div>
                        {#if room.focus && room.focused.cameraTrack && !room.focused.cameraTrack.isMuted}
                            <div
                                class="absolute top-4 right-4 max-h-60 max-w-60 overflow-hidden rounded-xs"
                            >
                                <ParticipantVideo
                                    track={room.focused.cameraTrack}
                                />
                            </div>
                        {/if}
                    {:else if room.focused.cameraTrack && !room.focused.cameraTrack.isMuted}
                        <div class="size-full overflow-hidden">
                            <ParticipantVideo
                                track={room.focused.cameraTrack}
                            />
                        </div>
                    {:else}
                        <div
                            class={[
                                "flex justify-center items-center bg-surface-dimmed p-8",
                                "border border-surface-border rounded-full"
                            ]}
                        >
                            <i class="ph ph-video-camera-slash text-[30px]"></i>
                        </div>
                    {/if}
                {:else}
                    <div class="text-center">
                        Выберите участника из <button
                            class="text-primary hover:underline"
                            onclick={() => (sidebarTab = "people")}
                        >
                            списка
                        </button> для просмотра его трансляции
                    </div>
                {/if}
                {#if room.focused}
                    <div
                        class={[
                            "absolute bottom-4 left-4 px-3 py-2",
                            "bg-primary text-on-primary text-md-regular rounded-full"
                        ]}
                    >
                        {room.focused.name}
                    </div>
                {/if}
            </main>
        {/key}
        <menu class="shrink-0 h-max flex justify-center gap-2">
            {@render tools()}
        </menu>
    </div>
    {#if sidebarTab !== null}
        <Sidebar
            {user}
            {courses}
            {call}
            {room}
            bind:tab={sidebarTab}
            onClose={() => {
                sidebarTab = null;
            }}
        />
    {/if}
</div>

{#each room.remoteParticipants as participant}
    {#if participant.microphoneTrack}
        <ParticipantAudio track={participant.microphoneTrack} />
    {/if}
{/each}

{#snippet tools()}
    {@const canPublish = room.localParticipant.metadata.permissions.canPublish}
    {@const overrideTitle = canPublish
        ? isAwaitingApproval
            ? "Включаем..."
            : null
        : "Вы не можете говорить в этом звонке"}
    <label
        class={[
            "call-toggle",
            room.localParticipant.microphoneEnabled && "enabled"
        ]}
        title={overrideTitle ??
            (room.localParticipant.microphoneEnabled
                ? "Выключить микрофон"
                : "Включить микрофон")}
    >
        {#if room.localParticipant.microphoneEnabled}
            <i class="ph ph-microphone text-[22px]"></i>
        {:else}
            <i class="ph ph-microphone-slash text-[22px]"></i>
        {/if}
        <input
            type="checkbox"
            class="hidden"
            checked={room.localParticipant.microphoneEnabled}
            onchange={onMicrophoneChange}
            disabled={!canPublish || isAwaitingApproval}
        />
    </label>
    <label
        class={[
            "call-toggle",
            room.localParticipant.cameraEnabled && "enabled"
        ]}
        title={overrideTitle ??
            (room.localParticipant.cameraEnabled
                ? "Выключить видеокамеру"
                : "Включить видеокамеру")}
    >
        {#if room.localParticipant.cameraEnabled}
            <i class="ph ph-video-camera text-[22px]"></i>
        {:else}
            <i class="ph ph-video-camera-slash text-[22px]"></i>
        {/if}
        <input
            type="checkbox"
            class="hidden"
            checked={room.localParticipant.cameraEnabled}
            onchange={onCameraChange}
            disabled={!canPublish || isAwaitingApproval}
        />
    </label>
    <label
        class={[
            "call-toggle",
            room.localParticipant.screenEnabled && "enabled"
        ]}
        title={overrideTitle ??
            (room.localParticipant.screenEnabled
                ? "Выключить трансляцию экрана"
                : "Включить трансляцию экрана")}
    >
        <i class="ph ph-monitor-arrow-up text-[22px]"></i>
        <input
            type="checkbox"
            class="hidden"
            checked={room.localParticipant.screenEnabled}
            onchange={onScreenChange}
            disabled={!canPublish || isAwaitingApproval}
        />
    </label>
    <button
        class={[
            "flex justify-center items-center size-12 rounded-full",
            "bg-danger text-on-danger"
        ]}
        title="Покинуть звонок"
        aria-label="Покинуть звонок"
        onclick={disconnect}
    >
        <i class="ph-fill ph-phone-slash text-[22px]"></i>
    </button>
    <button
        class={[
            "ml-auto",
            "flex justify-center items-center size-11 rounded-full",
            "hover:opacity-90",
            sidebarTab === null
                ? "bg-on-primary text-primary"
                : "bg-primary text-on-primary",
            "transition-all duration-100"
        ]}
        title="Открыть меню"
        aria-label="Открыть меню"
        onclick={() => {
            if (sidebarTab === null) {
                sidebarTab = "people";
            } else {
                sidebarTab = null;
            }
        }}
    >
        <i class="ph ph-list text-[22px]"></i>
    </button>
{/snippet}
