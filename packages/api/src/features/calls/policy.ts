import type { User } from "itam-edu-common";
import { CourseRepository } from "../courses/repository";
import type { CallDto } from "./dao";
import { CallParticipantDao } from "./participant.dao";
import { injectable } from "inversify";

@injectable()
export class CallPolicy {
    public constructor(
        private courseRepo: CourseRepository,
        private participantDao: CallParticipantDao
    ) {}

    /** Returns call permissions for the user, or null if call should not be accessible. */
    public async getPermissions(
        call: CallDto,
        user: User | null
    ): Promise<CallPermissions | null> {
        if (
            user &&
            (user.info.role === "admin" || user.info.role === "supervisor")
        ) {
            return {
                isAdmin: true,
                canPublish: true
            };
        }

        if (call.courseId === null) {
            const canPublish = await this.canPublish(call, user);
            return { canPublish, isAdmin: false };
        } else {
            const course = await this.courseRepo.getById(call.courseId);
            const coursePermissions = course?.getPermissionsFor(user);
            if (!course || !coursePermissions) return null;

            if (coursePermissions.calls.join !== true) return null;

            const canPublish = await this.canPublish(call, user);
            if (coursePermissions.calls.manage === true) {
                return { canPublish, isAdmin: true };
            }
            return { canPublish, isAdmin: false };
        }
    }

    private async canPublish(
        call: CallDto,
        user: User | null
    ): Promise<boolean> {
        if (!user) return false;
        const participation = await this.participantDao.get(call.id, user.id);
        if (participation && participation.isMuted) {
            return false;
        }
        return true;
    }
}

export type CallPermissions = {
    isAdmin: boolean;
    canPublish: boolean;
};
