import type { User } from "itam-edu-common";
import { injectable } from "inversify";
import { CallDao } from "./dao";
import { CourseRepository } from "../courses/repository";
import { LiveKit } from "../../infra/livekit";
import { CallParticipantDao } from "./participants/dao";
import { CallActionForbidden, CallNotFound } from "./errors";

@injectable()
export class StopCall {
    public constructor(
        private dao: CallDao,
        private courseRepo: CourseRepository,
        private livekit: LiveKit,
        private participantDao: CallParticipantDao
    ) {}

    public async invoke(actor: User, callId: string): Promise<void> {
        const call = await this.dao.get(callId);
        if (!call) throw new CallNotFound(callId);
        if (call.courseId === null) {
            if (actor.permissions.calls.create !== true) {
                throw new CallActionForbidden(callId);
            }
        } else {
            const course = await this.courseRepo.getById(call.courseId);
            const permissions = course?.getPermissionsFor(actor);
            if (!course || !permissions) {
                throw new CallNotFound(callId);
            }
            if (permissions.calls.manage !== true) {
                throw new CallActionForbidden(callId);
            }
        }

        await this.dao.end(callId, actor.id);
        await this.participantDao.callEnded(callId);
        await this.livekit.roomService.deleteRoom(callId);
    }
}
