<script lang="ts">
    import { onMount } from "svelte";
    import type { VideoTrackState } from "./state.svelte";

    let { track }: Props = $props();

    type Props = { track: VideoTrackState };

    onMount(() => {
        track.attach(video);
        return () => {
            track.detach();
        };
    });

    let video: HTMLVideoElement;
</script>

<!-- svelte-ignore a11y_media_has_caption -->
<video class="h-full w-full" controls={false} bind:this={video}></video>
