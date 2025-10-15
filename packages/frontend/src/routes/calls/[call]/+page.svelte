<script lang="ts">
    import api from "$lib/api";
    import { onMount } from "svelte";
    import { env } from "$env/dynamic/public";
    import { ConnectionState } from "livekit-client";
    import { getToaster } from "$lib/Toaster.svelte";
    import PhasePrepare from "./PhasePrepare.svelte";
    import PhaseCall from "./PhaseCall.svelte";
    import { invalidate } from "$app/navigation";
    import type { CallJoinData } from "$lib/types";
    import { RoomState } from "$lib/calls/room.svelte";

    let { data } = $props();
    const toaster = getToaster();

    let room = new RoomState();
    let joinData: CallJoinData | undefined = $state();
    const url = env.ITAMEDU_PUBLIC_LIVEKIT_URL!;

    onMount(() => {
        return () => room.disconnect();
    });

    const connect = async () => {
        if (!data.call) return;
        const resp = await api({ fetch })
            .calls({ call: data.call.id })
            .tokens.post();
        if (resp.error) {
            toaster.add("Не удалось получить код доступа", "error");
            await invalidate("app:call");
            return;
        }
        joinData = resp.data;
        try {
            await room.connect(url, joinData.token);
        } catch (e) {
            console.error(e);
            toaster.add("Не удалось подключиться к звонку", "error");
            return;
        }
    };
</script>

<div id="wrapper" class="flex flex-col items-stretch bg-background h-dvh">
    {#if room.state === ConnectionState.Disconnected}
        <PhasePrepare
            user={data.user}
            courses={data.courses}
            call={data.call}
            onReady={async ({ audio, video }) => {
                await connect();
                try {
                    if (audio) {
                        await room.localParticipant.setSourceEnabled(
                            "microphone",
                            true
                        );
                    }
                    if (video) {
                        await room.localParticipant.setSourceEnabled(
                            "camera",
                            true
                        );
                    }
                } finally {
                }
            }}
        />
    {:else if room.state === ConnectionState.Connecting}
        <main class="my-auto flex flex-col gap-4 justify-center items-center">
            <div class="flex flex-col items-center gap-2.5">
                Подключаемся...
            </div>
        </main>
    {:else if (room.state === ConnectionState.Connected || room.state === ConnectionState.Reconnecting || room.state === ConnectionState.SignalReconnecting) && joinData !== undefined}
        <PhaseCall
            user={data.user}
            courses={data.courses}
            call={data.call}
            {joinData}
            {room}
        />
    {/if}
</div>
