import { injectable } from "inversify";
import type { Course } from "../entity";
import type { User } from "itam-edu-common";
import {
    BadRequestError,
    ConflictError,
    ForbiddenError,
    HttpError,
    NotFoundError
} from "../../../api/errors";
import { Postgres } from "../../../infra/postgres";
import type { StaffRole } from "./schema";

@injectable()
export class EditStaffMemberRole {
    public constructor(protected postgres: Postgres) {}

    /** Changes staff member role. */
    public async invoke(
        actor: User,
        course: Course,
        target: User,
        role: StaffRole
    ): Promise<void | HttpError> {
        const permissions = course.getPermissionsFor(actor);
        if (permissions === null) return new NotFoundError("Course not found.");

        if (permissions.staff.manage !== true) {
            return new ForbiddenError(
                "You are not allowed to manage staff members."
            );
        }
        if (course.info.ownerId === target.id) {
            return new ConflictError("Course owner can only have admin role.");
        }
        if (!course.members.some(m => m.id === target.id)) {
            return new BadRequestError("User is not part of the course.");
        }

        await this.postgres.kysely
            .updateTable("userCourses")
            .set({ role })
            .where("courseId", "=", course.id)
            .where("userId", "=", target.id)
            .executeTakeFirst();
    }
}
