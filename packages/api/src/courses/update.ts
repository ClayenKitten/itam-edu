import { injectable } from "inversify";
import type { Course } from "./entity";
import type { User } from "itam-edu-common";
import { ForbiddenError, HttpError } from "../api/errors";
import { Postgres } from "../infra/postgres";
import { t } from "elysia";
import { CourseCache } from "./cache";

@injectable()
export class UpdateCourse {
    public constructor(
        protected postgres: Postgres,
        protected cache: CourseCache
    ) {}

    /** Promotes staff member. */
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
            case "banner":
            case "logo":
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

export const updateCourseDto = t.Partial(
    t.Object({
        title: t.String({ minLength: 1, maxLength: 200 }),
        description: t.Nullable(t.String({ maxLength: 1000 })),
        status: t.Nullable(t.String({ maxLength: 300 })),
        banner: t.Nullable(t.String({ maxLength: 100 })),
        logo: t.Nullable(t.String({ maxLength: 100 })),
        about: t.String({ maxLength: 32768 }),
        theme: t.String({ pattern: "^[a-z]+$" }),
        isPublished: t.Boolean(),
        isEnrollmentOpen: t.Boolean(),
        isArchived: t.Boolean()
    })
);
export type UpdateCourseDto = typeof updateCourseDto.static;
