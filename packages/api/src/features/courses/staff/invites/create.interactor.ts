import { injectable } from "inversify";
import { InviteRepository } from "./repository";
import type { User } from "itam-edu-common";
import { CourseRepository } from "../../repository";
import {
    ForbiddenError,
    NotFoundError,
    type HttpError
} from "../../../../api/errors";
import { Invite } from "./entity";
import type { StaffRole } from "../schema";

@injectable()
export class CreateInvite {
    public constructor(
        private repo: InviteRepository,
        private courseRepo: CourseRepository
    ) {}

    public async invoke(
        actor: User,
        courseId: string,
        role: StaffRole
    ): Promise<{ code: string } | HttpError> {
        const course = await this.courseRepo.getById(courseId);
        const permissions = course?.getPermissionsFor(actor);
        if (!course || !permissions) {
            return new NotFoundError("Course does not exist.");
        }
        if (permissions.staff.manage !== true) {
            return new ForbiddenError(
                "You are not allowed to create staff invites."
            );
        }

        const invite = Invite.create(course.id, role);
        await this.repo.save(invite);
        return { code: invite.code };
    }
}
