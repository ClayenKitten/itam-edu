import { injectable } from "inversify";
import type { User } from "itam-edu-common";
import type { Course } from "../entity";
import {
    BadRequestError,
    ConflictError,
    ForbiddenError,
    NotFoundError,
    type HttpError
} from "../../../api/errors";
import { Postgres } from "../../../infra/postgres";
import { CourseChangelog } from "../changes";

@injectable()
export class RemoveStaffMember {
    public constructor(
        private postgres: Postgres,
        private changelog: CourseChangelog
    ) {}

    /** Removes staff member. */
    public async invoke(
        actor: User,
        course: Course,
        target: User
    ): Promise<void | HttpError> {
        const permissions = course.getPermissionsFor(actor);
        if (permissions === null) return new NotFoundError("Course not found.");

        if (actor.id !== target.id && permissions.staff.manage !== true) {
            return new ForbiddenError(
                "You are not allowed to manage staff members."
            );
        }
        if (course.info.ownerId === target.id) {
            return new ConflictError("Course owner cannot be removed.");
        }
        if (!course.members.some(m => m.id === target.id)) {
            return new BadRequestError("User is not part of the course.");
        }

        await this.postgres.kysely
            .deleteFrom("userCourses")
            .where("courseId", "=", course.id)
            .where("userId", "=", target.id)
            .executeTakeFirst();

        await this.changelog.add(actor, course, {
            kind: "user-left",
            role: "staff",
            userId: target.id
        });
    }
}
