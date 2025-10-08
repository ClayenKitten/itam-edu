import {
    ConnectionState,
    isAudioTrack,
    isVideoTrack,
    LocalParticipant,
    Participant,
    RemoteParticipant,
    Room,
    Track,
    type AudioTrack,
    type VideoTrack
} from "livekit-client";

export class RoomState {
    public constructor() {
        this.localParticipant = new LocalParticipantState(
            this,
            this.room.localParticipant
        );

        this.room.on("connectionStateChanged", state => {
            this.state = state;
            if (state === ConnectionState.Connected) {
                this.localParticipant = new LocalParticipantState(
                    this,
                    this.room.localParticipant
                );
                this.room.registerTextStreamHandler(
                    "chat",
                    async (reader, { identity }) => {
                        const info = reader.info;
                        if (
                            info.size === undefined ||
                            info.size > 1024 * 1024
                        ) {
                            return;
                        }
                        const text = await reader.readAll();
                        this.messages.push({
                            id: info.id,
                            timestamp: info.timestamp,
                            sender: {
                                identity,
                                name:
                                    this.remoteParticipants.find(
                                        p => p.identity === identity
                                    )?.name ?? "Гость"
                            },
                            text
                        });
                    }
                );
                setTimeout(() => {
                    this.autofocus();
                }, 250);
            } else {
                this.room.unregisterTextStreamHandler("chat");
            }
        });
        this.room.on("participantConnected", participant => {
            this.remoteParticipants.filter(
                p => p.identity !== participant.identity
            );
            this.remoteParticipants.push(
                new RemoteParticipantState(this, participant)
            );
        });
        this.room.on("participantDisconnected", participant => {
            this.remoteParticipants = this.remoteParticipants.filter(
                p => p.identity !== participant.identity
            );
        });
    }

    private room: Room = new Room({
        audioCaptureDefaults: {
            noiseSuppression: true,
            echoCancellation: true,
            autoGainControl: true
        }
    });

    public state: ConnectionState = $state(ConnectionState.Disconnected);

    public localParticipant: LocalParticipantState = $state(
        null as any as LocalParticipantState // Definitely assigned in constructor
    );
    public remoteParticipants: RemoteParticipantState[] = $state([]);

    /** Participant that is focused on by the local participant. */
    public get focus(): ParticipantState | null {
        return (
            [this.localParticipant, ...this.remoteParticipants].find(
                p => p.identity === this.#focus
            ) ?? null
        );
    }
    public set focus(value: ParticipantState | null) {
        this.#focus = value === null ? value : value.identity;
    }
    #focus: string | null = $state(null);

    /**
     * Automatically focuses on the first participant with enabled camera or screenshare.
     *
     * Does nothing if focus is already set.
     * */
    public autofocus() {
        if (this.focus !== null) return;
        const showingParticipants = [
            this.localParticipant,
            ...this.remoteParticipants
        ].filter(
            r =>
                (r.screenTrack && !r.screenTrack.isMuted) ||
                (r.cameraTrack && !r.cameraTrack.isMuted)
        );
        const newFocus = showingParticipants.at(0);
        if (newFocus) this.focus = newFocus;
    }

    /** Chat messages. */
    public readonly messages: ChatMessage[] = $state([]);

    public async connect(url: string, token: string) {
        await this.room.connect(url, token);
        this.remoteParticipants = this.room.remoteParticipants
            .values()
            .map(p => new RemoteParticipantState(this, p))
            .toArray();
    }

    public async prepareConnection(url: string, token: string) {
        await this.room.prepareConnection(url, token);
    }

    public async disconnect() {
        await this.room.disconnect(true);
    }
}

export class ParticipantState {
    public constructor(
        protected room: RoomState,
        protected participant: Participant
    ) {
        this.name = this.participant.name;
        this.identity = this.participant.identity;
        this.permissions = this.participant.permissions;

        participant.on("participantNameChanged", newName => {
            this.name = newName;
        });
        participant.on("participantPermissionsChanged", permissions => {
            this.permissions = permissions;
        });
    }

    public identity: string = $state("");
    public name: string | undefined = $state();
    public permissions: Participant["permissions"] = $state();

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
}

export class RemoteParticipantState extends ParticipantState {
    public constructor(
        protected room: RoomState,
        protected override participant: RemoteParticipant
    ) {
        super(room, participant);
        for (const publication of this.participant.trackPublications.values()) {
            if (publication.track) {
                this.afterSubscribe(publication.track);
            } else {
                publication.on("subscribed", track =>
                    this.afterSubscribe(track)
                );
                publication.setSubscribed(true);
            }
        }

        participant.on("trackUnpublished", track => {
            if (track.source === "camera") {
                this.cameraTrack = null;
            } else if (track.source === "screen_share") {
                this.screenTrack = null;
            } else if (track.source === "microphone") {
                this.microphoneTrack = null;
            }
        });
        participant.on("trackMuted", () => {
            this.room.autofocus();
        });
        participant.on("trackSubscribed", track => {
            this.afterSubscribe(track);
        });
    }

    protected afterSubscribe(track: Track) {
        if (isVideoTrack(track)) {
            if (track.source === "camera") {
                this.cameraTrack = new VideoTrackState(track);
            } else if (track.source === "screen_share") {
                this.screenTrack = new VideoTrackState(track);
            }
            this.room.autofocus();
        } else if (isAudioTrack(track) && track.source === "microphone") {
            this.microphoneTrack = new AudioTrackState(track);
        }
    }
}

export class LocalParticipantState extends ParticipantState {
    public constructor(
        protected room: RoomState,
        protected override participant: LocalParticipant
    ) {
        super(room, participant);
        participant.on("localTrackUnpublished", track => {
            if (track.source === "camera") {
                this.cameraTrack = null;
            } else if (track.source === "screen_share") {
                this.screenTrack = null;
            } else if (track.source === "microphone") {
                this.microphoneTrack = null;
            }
        });
    }

    public async setSourceEnabled(
        source: "camera" | "microphone" | "screen_share",
        value: boolean
    ) {
        if (source === "microphone") {
            let result = await this.participant.setMicrophoneEnabled(value, {
                noiseSuppression: true,
                echoCancellation: true,
                autoGainControl: true
            });
            if (!result) throw new Error();
            if (result.isMuted) {
                this.microphoneTrack = null;
            } else {
                this.microphoneTrack = new AudioTrackState(result.audioTrack!);
            }
        } else if (source === "camera") {
            let result = await this.participant.setCameraEnabled(value);
            if (!result) throw new Error();
            if (result.isMuted) {
                this.cameraTrack = null;
            } else {
                this.cameraTrack = new VideoTrackState(result.videoTrack!);
            }
            this.room.autofocus();
        } else if (source === "screen_share") {
            let result = await this.participant.setScreenShareEnabled(
                value,
                { contentHint: "text" },
                { degradationPreference: "maintain-resolution" }
            );
            if (!result?.videoTrack) {
                this.screenTrack = null;
            } else {
                this.screenTrack = new VideoTrackState(result.videoTrack!);
            }
            this.room.autofocus();
        }
    }

    public async sendMessage(text: string): Promise<void> {
        const { id, timestamp } = await this.participant.sendText(text, {
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

export class AudioTrackState {
    public constructor(protected track: AudioTrack) {
        this.isMuted = track.isMuted;
        track.on("muted", () => (this.isMuted = true));
        track.on("unmuted", () => (this.isMuted = false));
    }

    public isMuted: boolean = $state(false);

    public attach(element?: HTMLMediaElement): HTMLMediaElement {
        return element ? this.track.attach(element) : this.track.attach();
    }
}

export class VideoTrackState {
    public constructor(protected track: VideoTrack) {
        this.isMuted = track.isMuted;
        track.on("muted", () => (this.isMuted = true));
        track.on("unmuted", () => (this.isMuted = false));
    }

    public isMuted: boolean = $state(false);

    public attach(element?: HTMLMediaElement): HTMLMediaElement {
        return element ? this.track.attach(element) : this.track.attach();
    }

    public detach() {
        this.track.detach();
    }
}

export type ChatMessage = {
    id: string;
    timestamp: number;
    sender: {
        identity: string;
        name: string;
    };
    text: string;
};
