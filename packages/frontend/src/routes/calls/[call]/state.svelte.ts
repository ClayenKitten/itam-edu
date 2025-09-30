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
            this.room.localParticipant
        );

        this.room.on("connectionStateChanged", state => (this.state = state));
        this.room.on("participantConnected", participant => {
            this.remoteParticipants.filter(
                p => p.identity !== participant.identity
            );
            this.remoteParticipants.push(
                new RemoteParticipantState(participant)
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

    public async connect(url: string, token: string) {
        await this.room.connect(url, token);
        this.remoteParticipants = this.room.remoteParticipants
            .values()
            .map(p => new RemoteParticipantState(p))
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
    public constructor(protected participant: Participant) {
        this.name = this.participant.name;
        this.identity = this.participant.identity;

        participant.on("participantNameChanged", newName => {
            this.name = newName;
        });
    }

    public identity: string = $state("");
    public name: string | undefined = $state();

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

    public readonly permissions = $derived.by(
        () => this.participant.permissions
    );
}

export class RemoteParticipantState extends ParticipantState {
    public constructor(protected override participant: RemoteParticipant) {
        super(participant);
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
        this.participant.on("trackSubscribed", track => {
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
        } else if (isAudioTrack(track) && track.source === "microphone") {
            this.microphoneTrack = new AudioTrackState(track);
        }
    }
}

export class LocalParticipantState extends ParticipantState {
    public constructor(protected override participant: LocalParticipant) {
        super(participant);

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
        } else if (source === "screen_share") {
            let result = await this.participant.setScreenShareEnabled(value);
            if (!result?.videoTrack) this.screenTrack = null;
            else this.screenTrack = new VideoTrackState(result.videoTrack!);
        }
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
