<script lang="ts">
    import { onMount } from "svelte";
    import type { AudioTrackState } from "./state.svelte";

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
