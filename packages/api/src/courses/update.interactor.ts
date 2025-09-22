import { injectable } from "inversify";
import type { Course } from "./entity";
import type { CoursePermissions, User } from "itam-edu-common";
import { ForbiddenError, HttpError, NotFoundError } from "../api/errors";
import { Postgres } from "../infra/postgres";
import type { UpdateCourseDto } from "./schema";

@injectable()
export class UpdateCourse {
    public constructor(protected postgres: Postgres) {}

    /** Updates course. */
    public async invoke(
        actor: User,
        course: Course,
        dto: UpdateCourseDto
    ): Promise<void | HttpError> {
        const permissions = course.getPermissionsFor(actor);
        if (permissions === null) return new NotFoundError("Course not found.");

        for (const key of Object.keys(dto) as (keyof UpdateCourseDto)[]) {
            if (dto[key] === undefined) continue;
            if (!this.isAllowedToModifyField(actor, permissions, key)) {
                return new ForbiddenError();
            }
        }

        await this.postgres.kysely
            .updateTable("courses")
            .where("id", "=", course.id)
            .set(dto)
            .executeTakeFirst();
    }

    /** Checks if user is authorized to modify provided field. */
    protected isAllowedToModifyField(
        user: User,
        permissions: CoursePermissions,
        updatedField: keyof UpdateCourseDto
    ): boolean {
        switch (updatedField) {
            case "title":
            case "description":
            case "cover":
            case "icon":
            case "banner":
            case "about":
            case "theme":
            case "status":
                return permissions.course.update === true;
            case "isPublished":
                return user.permissions.courses.publish === true;
            case "isArchived":
                return user.permissions.courses.archive === true;
            case "isEnrollmentOpen":
                return permissions.course.toggleEnrollment === true;
            default:
                let guard: never = updatedField;
                return false;
        }
    }
}
