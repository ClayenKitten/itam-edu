<script lang="ts">
    import { onMount } from "svelte";
    import type { VideoTrackState } from "./state.svelte";

    let { track, disablepictureinpicture = false }: Props = $props();

    type Props = {
        track: VideoTrackState;
        disablepictureinpicture?: boolean;
    };

    onMount(() => {
        track.attach(video);
    });

    let video: HTMLVideoElement;
</script>

<!-- svelte-ignore a11y_media_has_caption -->
<video
    class="h-full w-full"
    controls={false}
    bind:this={video}
    disablepictureinpicture={disablepictureinpicture ? true : null}
></video>
