import { injectable } from "inversify";
import type { Course } from "./entity";
import type { User } from "itam-edu-common";
import { ForbiddenError, HttpError } from "../api/errors";
import { Postgres } from "../infra/postgres";
import { CourseCache } from "./cache";
import type { UpdateCourseDto } from "./schema";

@injectable()
export class UpdateCourse {
    public constructor(
        protected postgres: Postgres,
        protected cache: CourseCache
    ) {}

    /** Updates course. */
    public async invoke(
        actor: User,
        course: Course,
        updates: UpdateCourseDto
    ): Promise<void | HttpError> {
        for (const key of Object.keys(updates) as (keyof UpdateCourseDto)[]) {
            if (updates[key] === undefined) continue;
            if (!this.isAllowedToModifyField(actor, course, key)) {
                console.log(updates, key);
                return new ForbiddenError();
            }
        }

        await this.postgres.kysely
            .updateTable("courses")
            .where("id", "=", course.id)
            .set(updates)
            .executeTakeFirst();

        await this.cache.delete(course.id);
    }

    /** Checks if user is authorized to modify provided field. */
    protected isAllowedToModifyField(
        actor: User,
        course: Course,
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
                return actor.hasCoursePermission(course.id, "canEditInfo");
            case "status":
                return actor.hasCoursePermission(course.id, "canEditContent");
            case "isPublished":
                return (
                    actor.hasPermission("canPublishCourses") &&
                    actor.hasCoursePermission(course.id, "isOwner")
                );
            case "isEnrollmentOpen":
            case "isArchived":
                return actor.hasCoursePermission(course.id, "isOwner");
            default:
                let guard: never = updatedField;
                return false;
        }
    }
}
