import type { User } from "itam-edu-common";
import { AccessToken, Room, RoomServiceClient } from "livekit-server-sdk";
import type { AppConfig } from "../config";

export class CallParticipantService {
    public constructor(private config: AppConfig["livekit"]) {}

    public async join(user: User, roomName: string): Promise<string> {
        // TODO: check permissions

        const token = new AccessToken(
            this.config.apiKey,
            this.config.secretKey,
            {
                identity: user.id,
                name: user.displayName,
                ttl: "10m"
            }
        );

        token.addGrant({
            roomJoin: true,
            room: roomName,
            roomCreate: true,
            // TODO: students should be hidden
            hidden: false,
            canSubscribe: true,
            // TODO: not all users should be able to talk
            canPublish: true
        });

        return await token.toJwt();
    }
}
