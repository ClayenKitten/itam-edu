import { inject, injectable } from "inversify";
import type { AppConfig } from "itam-edu-common/config";
import {
    AccessToken,
    RoomServiceClient,
    WebhookReceiver,
    type AccessTokenOptions
} from "livekit-server-sdk";

/** Provider of LiveKit apis. */
@injectable()
export class LiveKit {
    public constructor(
        @inject("AppConfig")
        protected config: AppConfig
    ) {
        this.roomService = new RoomServiceClient(
            config.livekit.url,
            config.livekit.apiKey,
            config.livekit.secretKey
        );
        this.webhookReceiver = new WebhookReceiver(
            this.config.livekit.apiKey,
            this.config.livekit.secretKey
        );
    }

    public readonly roomService: RoomServiceClient;
    public readonly webhookReceiver: WebhookReceiver;

    /** Creates new access token for the user. */
    public async createAccessToken(
        options: AccessTokenOptions
    ): Promise<AccessToken> {
        return new AccessToken(
            this.config.livekit.apiKey,
            this.config.livekit.secretKey,
            options
        );
    }
}
