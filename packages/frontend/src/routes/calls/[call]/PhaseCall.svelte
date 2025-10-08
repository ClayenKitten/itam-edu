<script lang="ts">
    import { getToaster } from "$lib/Toaster.svelte";
    import type { Call, CallJoinData, CoursePartial } from "$lib/types";
    import type { User } from "itam-edu-common";
    import ParticipantVideo from "./ParticipantVideo.svelte";
    import ParticipantAudio from "./ParticipantAudio.svelte";
    import type { RoomState } from "./state.svelte";
    import Sidebar from "./Sidebar.svelte";
    import { coursePath } from "$lib/path";

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
        {#key room.focus}
            <main
                class={[
                    "relative flex-1 overflow-hidden",
                    "flex flex-col gap-4 justify-center items-center",
                    "bg-surface shadow rounded-xs"
                ]}
            >
                {#if room.focus !== null}
                    {#if room.focus.screenTrack && !room.focus.screenTrack.isMuted}
                        <div class="size-full overflow-hidden">
                            <ParticipantVideo track={room.focus.screenTrack} />
                        </div>
                        {#if room.focus && room.focus.cameraTrack && !room.focus.cameraTrack.isMuted}
                            <div
                                class="absolute top-4 right-4 max-h-60 max-w-60 overflow-hidden rounded-xs"
                            >
                                <ParticipantVideo
                                    track={room.focus.cameraTrack}
                                />
                            </div>
                        {/if}
                    {:else if room.focus.cameraTrack && !room.focus.cameraTrack.isMuted}
                        <div class="size-full overflow-hidden">
                            <ParticipantVideo track={room.focus.cameraTrack} />
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
                    <div
                        class={[
                            "absolute top-0 left-0 w-max max-w-full",
                            "flex flex-col gap-1 p-6",
                            "bg-surface-dimmed shadow rounded-xs",
                            "border border-surface-border"
                        ]}
                    >
                        <h4>{call.title}</h4>
                        {#if course}
                            <h5>
                                Курс
                                <a
                                    class="text-primary hover:underline"
                                    href={coursePath(course)}
                                >
                                    {course.title}
                                </a>
                            </h5>
                        {/if}
                    </div>
                    <div class="text-center">
                        Выберите участника из <button
                            class="text-primary hover:underline"
                            onclick={() => (sidebarTab = "people")}
                        >
                            списка
                        </button> для просмотра его трансляции
                    </div>
                {/if}
                {#if room.focus}
                    <div
                        class={[
                            "absolute bottom-4 left-4 px-3 py-2",
                            "bg-primary text-on-primary text-md-regular rounded-full"
                        ]}
                    >
                        {room.focus.name}
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
            {joinData}
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
    <label
        class={[
            "call-toggle",
            room.localParticipant.microphoneEnabled && "enabled"
        ]}
        title={room.localParticipant.microphoneEnabled
            ? "Выключить микрофон"
            : "Включить микрофон"}
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
            disabled={isAwaitingApproval}
        />
    </label>
    <label
        class={[
            "call-toggle",
            room.localParticipant.cameraEnabled && "enabled"
        ]}
        title={room.localParticipant.cameraEnabled
            ? "Выключить видеокамеру"
            : "Включить видеокамеру"}
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
            disabled={isAwaitingApproval}
        />
    </label>
    <label
        class={[
            "call-toggle",
            room.localParticipant.screenEnabled && "enabled"
        ]}
        title={room.localParticipant.screenEnabled
            ? "Выключить трансляцию экрана"
            : "Включить трансляцию экрана"}
    >
        <i class="ph ph-monitor-arrow-up text-[22px]"></i>
        <input
            type="checkbox"
            class="hidden"
            checked={room.localParticipant.screenEnabled}
            onchange={onScreenChange}
            disabled={isAwaitingApproval}
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
