import { Room, RoomServiceClient } from "livekit-server-sdk";
import type { AppConfig } from "../config";

export class CallRoomService {
    public constructor(config: AppConfig["livekit"]) {
        this.livekit = new RoomServiceClient(
            config.url,
            config.apiKey,
            config.secretKey
        );
    }
    private livekit: RoomServiceClient;

    public async create(id: string): Promise<Room> {
        // TODO: check permissions

        return await this.livekit.createRoom({
            name: id,
            departureTimeout: 15 * 60
        });
    }

    // public async delete(): Promise<Room> {}

    // public async list(): Promise<Room[]> {}
}
