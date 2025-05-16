import { injectable } from "inversify";
import { Postgres } from "../infra/postgres";
import type { Course } from "../courses/entity";
import type { CoursePermissions, User } from "itam-edu-common";

@injectable()
export class StaffRepository {
    public constructor(protected postgres: Postgres) {}

    /** Returns ids of course staff members. */
    public async getAll(
        course: Course
    ): Promise<{ userId: string; title: string | null }[]> {
        const staff = await this.postgres.kysely
            .selectFrom("userCourses")
            .select(["userId", "title"])
            .where("courseId", "=", course.id)
            .where("isStaff", "=", true)
            .execute();
        return staff;
    }

    /** Adds user to the staff members list or updates their permissions and title. */
    public async set(
        course: Course,
        user: User,
        title: string | null,
        permissions: CoursePermissions
    ): Promise<void> {
        await this.postgres.kysely
            .insertInto("userCourses")
            .values({ courseId: course.id, userId: user.id })
            .onConflict(cb =>
                cb.columns(["courseId", "userId"]).doUpdateSet({
                    ...permissions,
                    isStaff: true,
                    courseId: course.id,
                    userId: user.id,
                    title
                })
            )
            .execute();
    }

    /**
     * Removes user from the staff members list.
     *
     * @returns `true` if staff member is removed, and `false` otherwise.
     * */
    public async remove(course: Course, user: User): Promise<boolean> {
        const result = await this.postgres.kysely
            .deleteFrom("userCourses")
            .where("courseId", "=", course.id)
            .where("userId", "=", user.id)
            .where("isStaff", "=", true)
            .executeTakeFirst();
        return result.numDeletedRows > 0n;
    }
}
