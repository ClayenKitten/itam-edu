<script lang="ts">
    import type { ParticipantState } from "./state.svelte";

    const { participant }: Props = $props();

    type Props = {
        participant: ParticipantState;
    };

    $effect(() => {
        if (participant.screenTrack) {
            participant.screenTrack.attach(video);
        }
        if (participant.microphoneTrack) {
            participant.microphoneTrack.attach(audio);
        }
    });

    let video: HTMLVideoElement;
    let audio: HTMLAudioElement;
</script>

<li>
    <span class="flex items-center h-10 gap-4">
        {participant.name}
        {#if participant.microphoneEnabled}
            <i class="ph ph-microphone"></i>
        {/if}
    </span>
    <!-- svelte-ignore a11y_media_has_caption -->
    <video
        class={[
            "border border-primary",
            participant.screenEnabled ? "" : "hidden"
        ]}
        bind:this={video}
    ></video>
    <audio class="hidden" bind:this={audio}></audio>
</li>
