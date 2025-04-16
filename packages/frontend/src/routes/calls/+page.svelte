<script lang="ts">
    import api from "$lib/api";
    import { Room } from "livekit-client";
    import { onMount } from "svelte";
    import ParticipantCard from "./ParticipantCard.svelte";
    import { RoomState } from "./state.svelte";
    import { env } from "$env/dynamic/public";

    let room = new RoomState();
    let token: string | undefined = $state();
    const url = env.ITAM_EDU_FRONTEND_LIVEKIT_URL!;

    onMount(async () => {
        console.log("Start");
        const resp = await api({ fetch })
            .calls({ call: "4b67a1db-0b8f-45f5-a466-6937c26c2043" })
            .participants.post();

        if (resp.error) return;
        token = resp.data.token;
        console.log("Token: ", token);
        room.prepareConnection(url, token);
    });

    onMount(() => {
        return () => {
            room.disconnect();
            console.log("DISCONNECT");
        };
    });
</script>

{#if room.state === "connected"}
    <main
        class={[
            "grid grid-cols-[1fr_300px] grid-rows-[1fr_auto]",
            "min-h-dvh w-full border border-primary"
        ]}
    >
        <div class="flex-1 flex flex-col items-center gap-10 m-auto"></div>
        <section class="row-span-2 flex flex-col gap-4 p-5 shadow">
            <h3>Участники</h3>
            <ul class="flex flex-col gap-4">
                {#each room.remoteParticipants as participant}
                    <ParticipantCard {participant} />
                {/each}
            </ul>
        </section>
        <menu class="flex gap-5 p-10">
            <button
                class="btn"
                onclick={() => {
                    room.localParticipant.setSourceEnabled(
                        "microphone",
                        !room.localParticipant.microphoneEnabled
                    );
                }}
            >
                {#if !room.localParticipant.microphoneEnabled}
                    Включить микрофон
                {:else}
                    Выключить микрофон
                {/if}
            </button>
            <button
                class="btn"
                onclick={() => {
                    room.localParticipant.setSourceEnabled(
                        "screen_share",
                        !room.localParticipant.screenEnabled
                    );
                }}
            >
                {#if !room.localParticipant.screenEnabled}
                    Включить показ экрана
                {:else}
                    Выключить показ экрана
                {/if}
            </button>
            <button
                class="btn ml-auto bg-[#c93333]"
                onclick={async () => {
                    await room.disconnect();
                }}
            >
                Выйти
            </button>
        </menu>
    </main>
{:else}
    <main class="h-dvh flex justify-center items-center">
        <div class="flex flex-col items-center gap-2.5">
            <p>{room.state}</p>
            <button
                class="btn"
                onclick={async () => {
                    await room.connect(url, token!);
                    console.log("CONNECTED!!");
                }}
            >
                Connect
            </button>
        </div>
    </main>
{/if}
