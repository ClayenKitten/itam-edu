import { injectable } from "inversify";
import { InviteRepository } from "./repository";
import type { User } from "itam-edu-common";
import { CourseRepository } from "../../repository";
import {
    ForbiddenError,
    NotFoundError,
    type HttpError
} from "../../../../api/errors";

@injectable()
export class RemoveInvite {
    public constructor(
        private repo: InviteRepository,
        private courseRepo: CourseRepository
    ) {}

    public async invoke(
        actor: User,
        courseId: string,
        code: string
    ): Promise<void | HttpError> {
        const course = await this.courseRepo.getById(courseId);
        const permissions = course?.getPermissionsFor(actor);
        if (!course || !permissions) {
            return new NotFoundError("Course does not exist.");
        }
        if (permissions.staff.manage !== true) {
            return new ForbiddenError(
                "You are not allowed to remove staff invites."
            );
        }

        await this.repo.remove(code);
    }
}
