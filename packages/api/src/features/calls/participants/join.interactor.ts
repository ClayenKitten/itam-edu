import type { User } from "itam-edu-common";
import { LiveKit } from "../../../infra/livekit";
import { randomUUID } from "crypto";
import { CallParticipantDao } from "./dao";
import { injectable } from "inversify";
import { CallDao } from "../dao";
import { type CallPermissions, CallPolicy } from "../policy";
import { CallEndedConflict, CallNotFound } from "../errors";
import type { ParticipantMetadata } from "..";

/** Application service that handles connection to the call. */
@injectable()
export class JoinCall {
    public constructor(
        private livekit: LiveKit,
        private dao: CallDao,
        private participantDao: CallParticipantDao,
        private policy: CallPolicy
    ) {}

    /**
     * Generates LiveKit token and records call attendance in case webhooks fail for some reason.
     *
     * @throws {CallNotFound}
     * @throws {CallEndedConflict}
     * */
    public async invoke(actor: User | null, callId: string): Promise<JoinDto> {
        const call = await this.dao.get(callId);
        const permissions = call
            ? await this.policy.getPermissions(call, actor)
            : null;
        if (!call || !permissions) {
            throw new CallNotFound(callId);
        }
        if (call.endedAt !== null) {
            throw new CallEndedConflict(callId);
        }

        const identity = actor?.id ?? "guest:" + randomUUID();
        const name = actor?.displayName ?? "Гость";
        if (actor) {
            await this.participantDao.joined(callId, actor.id);
        }
        const token = await this.livekit.createAccessToken({
            identity,
            name,
            ttl: "15s",
            metadata: JSON.stringify({
                permissions
            } satisfies ParticipantMetadata)
        });
        token.addGrant({
            room: callId,
            roomJoin: true,
            roomCreate: false,
            roomAdmin: permissions.isAdmin,
            ...this.policy.toLivekit(permissions)
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
