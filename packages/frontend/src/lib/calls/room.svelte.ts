import { ConnectionState, Room } from "livekit-client";
import {
    LocalParticipantState,
    RemoteParticipantState,
    type ParticipantState
} from "./participant.svelte";

export class RoomState {
    public constructor() {
        this.localParticipant = $state(
            new LocalParticipantState(this, this.room.localParticipant)
        );
        this.remoteParticipants = $state([]);
        this.participants = $derived([
            this.localParticipant,
            ...this.remoteParticipants
        ]);
        this.focused = $derived(
            this.participants.find(p => p.identity === this.focus) ?? null
        );

        this.room.on("connectionStateChanged", state => {
            this.state = state;
            this.localParticipant = new LocalParticipantState(
                this,
                this.room.localParticipant
            );
            if (state === ConnectionState.Connected) {
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
                console.log("STATE CHANGED", state);
                this.room.unregisterTextStreamHandler("chat");
            }
        });
        this.room.on("participantConnected", participant => {
            this.remoteParticipants = this.remoteParticipants.filter(
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

    public localParticipant: LocalParticipantState;
    public remoteParticipants: RemoteParticipantState[];
    public readonly participants: ParticipantState[];

    public focus: string | null = $state(null);
    public readonly focused: ParticipantState | null;

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
        if (newFocus) this.focus = newFocus.identity;
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

export type ChatMessage = {
    id: string;
    timestamp: number;
    sender: {
        identity: string;
        name: string;
    };
    text: string;
};
