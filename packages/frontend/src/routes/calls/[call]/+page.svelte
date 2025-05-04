<script lang="ts">
    import api from "$lib/api";
    import { onMount } from "svelte";
    import { ParticipantState, RoomState } from "./state.svelte";
    import { env } from "$env/dynamic/public";
    import ParticipantAudio from "./ParticipantAudio.svelte";
    import ParticipantVideo from "./ParticipantVideo.svelte";
    import { ConnectionState } from "livekit-client";
    import { goto } from "$app/navigation";

    let { data } = $props();

    let room = new RoomState();
    let focus: ParticipantState | null = $state(null);
    let token: string | undefined = $state();
    const url = env.ITAM_EDU_FRONTEND_LIVEKIT_URL!;

    onMount(() => {
        return () => room.disconnect();
    });

    const connect = async () => {
        const resp = await api({ fetch })
            .calls({ call: data.call.id })
            .tokens.post();

        if (resp.error) return;
        token = resp.data.token;
        await room.connect(url, token!);
    };
    const disconnect = async () => {
        await room.disconnect();
        await goto("/home");
    };
</script>

<svelte:head>
    <title>{data.call.title} | ITAM Education</title>
    <meta
        name="description"
        content={`Подключитесь к звонку "${data.call.title}"`}
    />
</svelte:head>

{#if room.state === "connected"}
    <div
        id="wrapper"
        class={[
            "grid grid-cols-[1fr_300px] grid-rows-[75px_minmax(0,1fr)_auto]",
            "gap-4 p-8 h-dvh max-h-dvh bg-background"
        ]}
    >
        <header
            class="flex justify-between items-center px-4 col-span-2 bg-surface shadow rounded-md"
        >
            <h3>{data.call.title}</h3>
            <button class="btn" onclick={disconnect}>Выйти</button>
        </header>
        <main
            class="flex flex-col gap-4 p-8 justify-center items-center bg-surface shadow rounded-md"
        >
            {#if focus}
                {#if focus.screenTrack}
                    <div class="overflow-hidden rounded-xs">
                        <ParticipantVideo track={focus.screenTrack} />
                    </div>
                {:else if focus.cameraTrack}
                    <div class="overflow-hidden rounded-xs">
                        <ParticipantVideo track={focus.cameraTrack} />
                    </div>
                {/if}
                <span>
                    {focus.name}
                    {#if focus === room.localParticipant}
                        <span class="text-on-surface-muted">(вы)</span>
                    {/if}
                </span>
            {/if}
        </main>
        <aside
            class="flex flex-col overflow-y-auto bg-surface shadow rounded-md"
        >
            {#each [room.localParticipant, ...room.remoteParticipants] as participant}
                <button
                    class={[
                        "flex flex-col gap-2 p-4 border-b border-surface-border",
                        focus !== participant
                            ? "bg-surface"
                            : "bg-surface-tint",
                        "hover:bg-surface-tint transition-colors duration-100"
                    ]}
                    onclick={() => (focus = participant)}
                >
                    <header class="flex items-center gap-2 h-6">
                        <span>
                            {participant.name}
                            {#if room.localParticipant === participant}
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
                    </header>
                    {#if participant.microphoneTrack}
                        <ParticipantAudio track={participant.microphoneTrack} />
                    {/if}
                    {#if participant.screenTrack}
                        <div class="max-h-70 overflow-hidden rounded-xs">
                            <ParticipantVideo
                                track={participant.screenTrack}
                                disablepictureinpicture
                            />
                        </div>
                    {/if}
                </button>
            {/each}
        </aside>
        <menu class="flex justify-center gap-2">
            {@render controlBtn({
                enabled: room.localParticipant.microphoneEnabled,
                titleEnabled: "Выключить микрофон",
                iconEnabled: "ph-microphone",
                titleDisabled: "Включить микрофон",
                iconDisabled: "ph-microphone-slash",
                onclick: () => {
                    room.localParticipant.setSourceEnabled(
                        "microphone",
                        !room.localParticipant.microphoneEnabled
                    );
                }
            })}
            {@render controlBtn({
                enabled: room.localParticipant.cameraEnabled,
                titleEnabled: "Выключить видеокамеру",
                iconEnabled: "ph-video-camera",
                titleDisabled: "Включить видеокамеру",
                iconDisabled: "ph-video-camera-slash",
                onclick: () => {
                    room.localParticipant.setSourceEnabled(
                        "camera",
                        !room.localParticipant.cameraEnabled
                    );
                }
            })}
            {@render controlBtn({
                enabled: room.localParticipant.screenEnabled,
                titleEnabled: "Выключить трансляцию экрана",
                iconEnabled: "ph-monitor-arrow-up",
                titleDisabled: "Включить трансляцию экрана",
                iconDisabled: "ph-monitor-arrow-up",
                onclick: () => {
                    room.localParticipant.setSourceEnabled(
                        "screen_share",
                        !room.localParticipant.screenEnabled
                    );
                }
            })}
        </menu>
    </div>
{:else}
    <main class="h-dvh flex flex-col gap-4 justify-center items-center">
        <div class="flex flex-col items-center gap-2.5">
            <h4>{data.call.title}</h4>
            {#if room.state === ConnectionState.Disconnected}
                <button class="btn" onclick={connect}>Подключиться</button>
            {:else if room.state === ConnectionState.Connecting}
                Подключаемся...
            {:else if room.state === ConnectionState.Reconnecting || room.state === ConnectionState.SignalReconnecting}
                Переподключаемся...
            {/if}
        </div>
    </main>
{/if}

{#snippet controlBtn(opts: {
    enabled: boolean;
    titleEnabled: string;
    iconEnabled: `ph-${string}`;
    titleDisabled: string;
    iconDisabled: `ph-${string}`;
    onclick: () => void;
})}
    <button
        class={[
            "flex justify-center items-center w-12 h-12 rounded-xl shadow",
            "transition-colors duration-100",
            opts.enabled
                ? "text-on-primary bg-primary hover:opacity-95"
                : "text-primary bg-on-primary hover:border hover:border-primary"
        ]}
        title={opts.enabled ? opts.titleEnabled : opts.titleDisabled}
        onclick={opts.onclick}
    >
        {#if opts.enabled}
            <i class="ph {opts.iconEnabled} text-[22px]"></i>
        {:else}
            <i class="ph {opts.iconDisabled} text-[22px]"></i>
        {/if}
    </button>
{/snippet}
