import { injectable } from "inversify";
import { InviteRepository } from "./repository";
import type { User } from "itam-edu-common";
import { CourseRepository } from "../../repository";
import {
    ConflictError,
    NotFoundError,
    type HttpError
} from "../../../api/errors";
import { Postgres } from "../../../infra/postgres";

@injectable()
export class RedeemInvite {
    public constructor(
        private repo: InviteRepository,
        private courseRepo: CourseRepository,
        private postgres: Postgres
    ) {}

    public async invoke(actor: User, code: string): Promise<void | HttpError> {
        const invite = await this.repo.load(code);
        if (!invite) {
            return new NotFoundError("Invite not found.");
        }
        const course = await this.courseRepo.getById(invite.courseId);
        if (!course) {
            return new NotFoundError("Course does not exist.");
        }
        if (actor.isCourseMember(course.id)) {
            return new ConflictError("You are already member of the course.");
        }

        await Promise.all([
            this.postgres.kysely
                .insertInto("userCourses")
                .values({
                    courseId: invite.courseId,
                    userId: actor.id,
                    role: invite.role
                })
                .execute(),
            this.repo.remove(code)
        ]);
    }
}
