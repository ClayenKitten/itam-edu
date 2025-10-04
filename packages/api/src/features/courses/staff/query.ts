import { injectable } from "inversify";
import type { Course } from "../entity";
import { Postgres } from "../../../infra/postgres";
import type { StaffMemberDto, StaffRole } from "./schema";
import type { User } from "itam-edu-common";
import { HttpError, NotFoundError } from "../../../api/errors";

@injectable()
export class StaffQuery {
    public constructor(protected postgres: Postgres) {}

    /** Returns all staff members. */
    public async getAll(
        actor: User | null,
        course: Course
    ): Promise<StaffMemberDto[] | HttpError> {
        const permissions = course.getPermissionsFor(actor);
        if (permissions === null) return new NotFoundError("Course not found.");

        return await this.postgres.kysely
            .selectFrom("userCourses")
            .innerJoin("users", "userCourses.userId", "users.id")
            .select([
                "users.id",
                "users.firstName",
                "users.lastName",
                "users.bio",
                "users.avatar",
                "users.tgUsername",
                "userCourses.courseId",
                "userCourses.role"
            ])
            .where("userCourses.courseId", "=", course.id)
            .where(eb =>
                eb.or([
                    eb("userCourses.role", "=", "admin"),
                    eb("userCourses.role", "=", "teacher")
                ])
            )
            .$narrowType<{ role: StaffRole }>()
            .orderBy("tgUsername asc")
            .execute();
    }
}
