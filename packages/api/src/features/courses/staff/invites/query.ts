import { injectable } from "inversify";
import { User } from "itam-edu-common";
import {
    ForbiddenError,
    NotFoundError,
    type HttpError
} from "../../../../api/errors";
import { CourseRepository } from "../../repository";
import type { StaffRole } from "../schema";
import { InviteRepository } from "./repository";

@injectable()
export class InviteQuery {
    public constructor(
        private courseRepo: CourseRepository,
        private repo: InviteRepository
    ) {}

    public async get(
        actor: User,
        code: string
    ): Promise<InviteDto | HttpError> {
        const invite = await this.repo.load(code);
        if (!invite) return new NotFoundError("Invite code not found.");
        const course = await this.courseRepo.getById(invite.courseId);
        if (!course) return new NotFoundError("Course does not exist.");

        return {
            code: invite.code,
            courseId: course.id,
            courseTitle: course.info.title,
            role: invite.role,
            expiresAt: invite.expiresAt
        };
    }

    public async getAll(
        actor: User,
        courseId: string
    ): Promise<InviteDto[] | HttpError> {
        const course = await this.courseRepo.getById(courseId);
        const permissions = course?.getPermissionsFor(actor);
        if (!course || !permissions) {
            return new NotFoundError("Course does not exist.");
        }
        if (permissions.staff.manage !== true) {
            return new ForbiddenError(
                "You are not allowed to view staff invites."
            );
        }

        const invites = await this.repo.loadAll(courseId);
        return invites.map(i => ({
            code: i.code,
            courseId: course.id,
            courseTitle: course.info.title,
            role: i.role,
            expiresAt: i.expiresAt
        }));
    }
}

export type InviteDto = {
    code: string;
    courseId: string;
    courseTitle: string;
    role: StaffRole;
    expiresAt: Date;
};
