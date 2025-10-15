<script lang="ts">
    import type { AudioTrackState } from "$lib/calls/track.svelte";
    import { onMount } from "svelte";

    let { track }: Props = $props();

    type Props = {
        track: AudioTrackState;
    };

    onMount(() => {
        track.attach(audio);
    });

    let audio: HTMLAudioElement;
</script>

<audio class="hidden" bind:this={audio}></audio>
