import {
    isAudioTrack,
    isVideoTrack,
    Track,
    type LocalParticipant,
    type Participant,
    type RemoteParticipant
} from "livekit-client";
import type { RoomState } from "./room.svelte";
import { AudioTrackState, VideoTrackState } from "./track.svelte";
import type { ParticipantMetadata } from "$lib/types";

export abstract class ParticipantState {
    public constructor(
        protected room: RoomState,
        protected internal: Participant
    ) {
        this.identity = $state(this.internal.identity);
        this.name = $state(this.internal.name);
        this.permissions = $state(this.internal.permissions);
        this.metadata = $state(JSON.parse(this.internal.metadata ?? "{}"));

        internal.on("participantNameChanged", newName => {
            this.name = newName;
        });
        internal.on("participantPermissionsChanged", () => {
            this.permissions = this.internal.permissions;
        });
        internal.on("participantMetadataChanged", () => {
            this.metadata = JSON.parse(this.internal.metadata ?? "{}");
        });
    }

    public identity: string;
    public name: string | undefined;
    public permissions: Participant["permissions"];
    public metadata: ParticipantMetadata;

    public microphoneTrack: AudioTrackState | null = $state(null);
    public readonly microphoneEnabled: boolean = $derived(
        this.microphoneTrack !== null && !this.microphoneTrack.isMuted
    );
    public cameraTrack: VideoTrackState | null = $state(null);
    public readonly cameraEnabled: boolean = $derived(
        this.cameraTrack !== null && !this.cameraTrack.isMuted
    );
    public screenTrack: VideoTrackState | null = $state(null);
    public readonly screenEnabled: boolean = $derived(
        this.screenTrack !== null && !this.screenTrack.isMuted
    );

    /** Updates track state of the participant. */
    protected refreshTracks() {
        console.log("Refreshing tracks!");

        const microphone = this.internal.getTrackPublication(
            Track.Source.Microphone
        );
        if (microphone && microphone.audioTrack) {
            this.microphoneTrack = new AudioTrackState(microphone.audioTrack);
        } else {
            this.microphoneTrack = null;
        }

        const camera = this.internal.getTrackPublication(Track.Source.Camera);
        if (camera && camera.videoTrack) {
            this.cameraTrack = new VideoTrackState(camera.videoTrack);
        } else {
            this.cameraTrack = null;
        }

        const screen = this.internal.getTrackPublication(
            Track.Source.ScreenShare
        );
        if (screen && screen.videoTrack) {
            this.screenTrack = new VideoTrackState(screen.videoTrack);
        } else {
            this.screenTrack = null;
        }
    }
}

export class RemoteParticipantState extends ParticipantState {
    public constructor(
        protected room: RoomState,
        protected override internal: RemoteParticipant
    ) {
        super(room, internal);
        this.refreshTracks();
        internal.on("trackPublished", () => this.refreshTracks());
        internal.on("trackUnpublished", () => this.refreshTracks());
        internal.on("trackSubscribed", () => this.refreshTracks());

        internal.on("trackMuted", () => {
            this.room.autofocus();
        });
    }
}

export class LocalParticipantState extends ParticipantState {
    public constructor(
        protected room: RoomState,
        protected override internal: LocalParticipant
    ) {
        super(room, internal);
        this.refreshTracks();
        internal.on("localTrackPublished", () => this.refreshTracks());
        internal.on("localTrackUnpublished", () => this.refreshTracks());
    }

    public async setSourceEnabled(
        source: "camera" | "microphone" | "screen_share",
        value: boolean
    ) {
        if (source === "microphone") {
            let result = await this.internal.setMicrophoneEnabled(value, {
                noiseSuppression: true,
                echoCancellation: true,
                autoGainControl: true
            });
            if (!result) throw new Error();
        } else if (source === "camera") {
            let result = await this.internal.setCameraEnabled(value);
            if (!result) throw new Error();
            this.room.autofocus();
        } else if (source === "screen_share") {
            let result = await this.internal.setScreenShareEnabled(
                value,
                { contentHint: "text" },
                { degradationPreference: "maintain-resolution" }
            );
            if (!result) throw new Error("yeet");
            this.room.autofocus();
        }
        this.refreshTracks();
    }

    /** Sends a message to the chat. */
    public async sendMessage(text: string): Promise<void> {
        const { id, timestamp } = await this.internal.sendText(text, {
            topic: "chat"
        });
        this.room.messages.push({
            id,
            timestamp,
            sender: { identity: this.identity, name: this.name ?? "Вы" },
            text
        });
    }
}
