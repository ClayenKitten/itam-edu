import type { User } from "itam-edu-common";
import { LiveKit } from "../infra/livekit";
import { randomUUID } from "crypto";
import { CallParticipantDao } from "./participant.dao";
import { ConflictError, NotFoundError, type HttpError } from "../api/errors";
import { injectable } from "inversify";
import { CallDao } from "./dao";
import { type CallPermissions, CallPolicy } from "./policy";

@injectable()
export class JoinCall {
    public constructor(
        private livekit: LiveKit,
        private dao: CallDao,
        private participantDao: CallParticipantDao,
        private policy: CallPolicy
    ) {}

    public async invoke(
        actor: User | null,
        callId: string
    ): Promise<JoinDto | HttpError> {
        const identity = actor?.id ?? "guest:" + randomUUID();
        const name = actor?.displayName ?? "Гость";

        const call = await this.dao.get(callId);
        const permissions = call
            ? await this.policy.getPermissions(call, actor)
            : null;
        if (!call || !permissions) return new NotFoundError("Call not found");

        if (call.endedAt !== null) {
            return new ConflictError("Call has already completed.");
        }

        if (actor) {
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
            hidden: true,
            canSubscribe: true,
            canPublish: permissions.canPublish,
            roomAdmin: permissions.isAdmin,
            canPublishData: false
        });
        const tokenJwt = await token.toJwt();
        return {
            token: tokenJwt,
            permissions
        };
    }
}

export type JoinDto = {
    token: string;
    permissions: CallPermissions;
};
