import type { AudioTrack, VideoTrack } from "livekit-client";

export class AudioTrackState {
    public constructor(protected internal: AudioTrack) {
        this.isMuted = internal.isMuted;
        internal.on("muted", () => (this.isMuted = true));
        internal.on("unmuted", () => (this.isMuted = false));
    }

    public isMuted: boolean = $state(false);

    public attach(element?: HTMLMediaElement): HTMLMediaElement {
        return element ? this.internal.attach(element) : this.internal.attach();
    }
}

export class VideoTrackState {
    public constructor(protected internal: VideoTrack) {
        this.isMuted = internal.isMuted;
        internal.on("muted", () => (this.isMuted = true));
        internal.on("unmuted", () => (this.isMuted = false));
    }

    public isMuted: boolean = $state(false);

    public attach(element?: HTMLMediaElement): HTMLMediaElement {
        return element ? this.internal.attach(element) : this.internal.attach();
    }

    public detach() {
        this.internal.detach();
    }
}
