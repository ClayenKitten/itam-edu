import type { User } from "itam-edu-common";
import { injectable } from "inversify";
import { CallDao } from "./dao";
import { NotFoundError, type HttpError } from "../api/errors";
import { CourseRepository } from "../courses/repository";
import { LiveKit } from "../infra/livekit";

@injectable()
export class StopCall {
    public constructor(
        private dao: CallDao,
        private courseRepo: CourseRepository,
        private livekit: LiveKit
    ) {}

    public async invoke(
        actor: User,
        callId: string
    ): Promise<void | HttpError> {
        const call = await this.dao.get(callId);
        if (!call) return new NotFoundError("Call does not exist.");
        if (call.courseId === null) {
            if (actor.permissions.calls.create !== true) {
                return new NotFoundError("Call does not exist.");
            }
        } else {
            const course = await this.courseRepo.getById(call.courseId);
            const permissions = course?.getPermissionsFor(actor);
            if (!course || !permissions) {
                return new NotFoundError("Call does not exist.");
            }
            if (permissions.calls.start !== true) {
                return new NotFoundError("Call does not exist.");
            }
        }
        await this.dao.end(callId, actor.id);
        await this.livekit.roomService.deleteRoom(callId);
    }
}
