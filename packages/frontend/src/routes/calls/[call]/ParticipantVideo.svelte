<script lang="ts">
    import type { VideoTrackState } from "$lib/calls/track.svelte";
    import { onMount } from "svelte";

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
<video
    class="h-full w-full"
    controls={false}
    bind:this={video}
    ondblclick={async () => {
        if (document.fullscreenElement) {
            await document.exitFullscreen();
        } else {
            await video.requestFullscreen();
        }
    }}
></video>
