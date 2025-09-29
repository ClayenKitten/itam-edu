import type { User } from "itam-edu-common";
import { LiveKit } from "../infra/livekit";
import { randomUUID } from "crypto";
import { CallParticipantDao } from "./participant.dao";
import { ConflictError, NotFoundError, type HttpError } from "../api/errors";
import { injectable } from "inversify";
import { CallDao } from "./dao";

@injectable()
export class JoinCall {
    public constructor(
        private livekit: LiveKit,
        private dao: CallDao,
        private participantDao: CallParticipantDao
    ) {}

    public async invoke(
        actor: User | null,
        callId: string
    ): Promise<string | HttpError> {
        const identity = actor?.id ?? "guest:" + randomUUID();
        const name = actor?.displayName ?? "Гость";

        const call = await this.dao.get(callId);
        if (!call) return new NotFoundError("Call not found");

        if (call.endedAt !== null) {
            return new ConflictError("Call has already completed.");
        }

        let canPublish = false;
        if (actor) {
            const participation = await this.participantDao.get(
                callId,
                actor.id
            );
            if (!participation || !participation.isMuted) {
                canPublish = true;
            }
            await this.participantDao.joined(callId, actor.id);
        }

        const token = await this.livekit.createAccessToken({
            identity,
            name,
            ttl: "15s"
        });
        token.addGrant({
            room: callId,
            roomJoin: true,
            roomCreate: false,
            hidden: false,
            canSubscribe: true,
            canPublish,
            canPublishData: false
        });
        return await token.toJwt();
    }
}
