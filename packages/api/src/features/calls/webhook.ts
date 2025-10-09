import { injectable } from "inversify";
import { LiveKit } from "../../infra/livekit";
import logger from "../../logger";
import { CallParticipantDao } from "./participant.dao";
import { ParticipantInfo_Kind } from "@livekit/protocol";

@injectable()
export class LiveKitWebhookHandler {
    public constructor(
        private livekit: LiveKit,
        private participantDao: CallParticipantDao
    ) {}

    /** Handles livekit webhook. */
    public async handle(body: string, authorization: string) {
        const event = await this.livekit.webhookReceiver.receive(
            body,
            authorization
        );
        logger.trace("LiveKit webhook received", {
            id: event.id,
            kind: event.event,
            roomName: event.room?.name,
            participant: event.participant?.identity
        });
        switch (event.event) {
            case "participant_joined": {
                if (
                    event.participant?.kind !== ParticipantInfo_Kind.STANDARD ||
                    event.participant!.identity.startsWith("guest:")
                ) {
                    return;
                }
                if (event.participant!.identity.startsWith("guest:")) {
                    return;
                }
                await this.participantDao.joined(
                    event.room!.name,
                    event.participant.identity
                );
                break;
            }
            case "participant_left": {
                if (
                    event.participant?.kind !== ParticipantInfo_Kind.STANDARD ||
                    event.participant!.identity.startsWith("guest:")
                ) {
                    return;
                }
                await this.participantDao.left(
                    event.room!.name,
                    event.participant.identity
                );
                break;
            }
            default: {
                // We are not interested in other event types.
            }
        }
    }
}
