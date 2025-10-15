import type { User } from "itam-edu-common";
import { LiveKit } from "../../../infra/livekit";
import { CallParticipantDao } from "./dao";
import { injectable } from "inversify";
import { CallDao } from "../dao";
import { CallPolicy } from "../policy";
import {
    CallActionForbidden,
    CallEndedConflict,
    CallNotFound
} from "../errors";
import { ParticipantNotFound } from "./errors";

/** Updates call participant. */
@injectable()
export class UpdateParticipant {
    public constructor(
        private livekit: LiveKit,
        private dao: CallDao,
        private participantDao: CallParticipantDao,
        private policy: CallPolicy
    ) {}

    /**
     * Updates call participant.
     *
     * @throws {CallNotFound}
     * @throws {CallEndedConflict}
     * @throws {CallActionForbidden}
     * @throws {ParticipantNotFound}
     * */
    public async invoke(
        actor: User,
        callId: string,
        participantId: string,
        dto: UpdateParticipantDto
    ): Promise<void> {
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
        if (!permissions.isAdmin) {
            throw new CallActionForbidden(callId);
        }
        if ((await this.participantDao.get(callId, participantId)) === null) {
            throw new ParticipantNotFound();
        }

        await this.participantDao.update(callId, participantId, dto);
        await this.livekit.roomService.updateParticipant(
            callId,
            participantId,
            { permission: this.policy.toLivekit(permissions) }
        );
    }
}

export type UpdateParticipantDto = {
    isMuted: boolean;
};
