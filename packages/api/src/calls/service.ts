import { injectable } from "inversify";
import type { User } from "itam-edu-common";
import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
import { randomUUID } from "crypto";
import { Call, type CallMetadata } from "./entity";
import { AppConfig } from "../config";

@injectable()
export class CallService {
    public constructor(protected config: AppConfig) {
        this.client = new RoomServiceClient(
            config.livekit.url,
            config.livekit.apiKey,
            config.livekit.secretKey
        );
    }

    private client: RoomServiceClient;

    /** Returns a call by id. */
    public async getById(id: string): Promise<Call | null> {
        const livekitRoom = (await this.client.listRooms([id])).at(0);
        if (!livekitRoom) return null;
        let metadata = JSON.parse(livekitRoom.metadata) as CallMetadata;
        return new Call(id, metadata.title, metadata.ownerId);
    }

    /** Returns all ongoing calls. */
    public async getAll(): Promise<Call[]> {
        const rooms = await this.client.listRooms();
        return rooms.map(room => {
            let metadata = JSON.parse(room.metadata) as CallMetadata;
            return new Call(room.name, metadata.title, metadata.ownerId);
        });
    }

    /** Starts a new call. */
    public async create(actor: User, title: string): Promise<Call> {
        const id = randomUUID();
        await this.client.createRoom({
            name: id,
            emptyTimeout: 1 * 60 * 60,
            departureTimeout: 1 * 60 * 60,
            metadata: JSON.stringify({
                ownerId: actor.id,
                title
            } satisfies CallMetadata)
        });
        return new Call(id, title, actor.id);
    }

    /** Creates new access token for the user. */
    public async createAccessToken(actor: User, call: Call): Promise<string> {
        const token = new AccessToken(
            this.config.livekit.apiKey,
            this.config.livekit.secretKey,
            {
                identity: actor.id,
                name: actor.displayName,
                ttl: "15s"
            }
        );

        token.addGrant({
            room: call.id,
            roomJoin: true,
            roomCreate: false,
            hidden: false,
            canSubscribe: true,
            canPublish: true
        });

        return await token.toJwt();
    }
}
