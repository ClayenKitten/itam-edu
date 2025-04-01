import { Repository } from "../db/repository";
import type { User } from "../users/entity";
import type { Course } from "../courses/entity";
import type { coursePermissions } from "../users/schema";

export default class StaffRepository extends Repository {
    /** Returns ids of course staff members. */
    public async getAll(course: Course) {
        const staff = await this.db
            .selectFrom("courseStaff")
            .select(["userId", "title"])
            .where("courseId", "=", course.id)
            .execute();
        return staff;
    }

    /** Adds user to the staff members list or updates their permissions and title. */
    public async set(
        course: Course,
        user: User,
        title: string | null,
        permissions: typeof coursePermissions.static
    ): Promise<void> {
        await this.db
            .insertInto("courseStaff")
            .values({ courseId: course.id, userId: user.id })
            .onConflict(cb =>
                cb.columns(["courseId", "userId"]).doUpdateSet({
                    ...permissions,
                    courseId: course.id,
                    userId: user.id,
                    title
                })
            )
            .execute();
    }

    /** Removes user from the staff members list. */
    public async remove(course: Course, user: User): Promise<boolean> {
        const result = await this.db
            .deleteFrom("courseStaff")
            .where("courseId", "=", course.id)
            .where("userId", "=", user.id)
            .executeTakeFirst();
        return result.numDeletedRows > 0n;
    }
}
