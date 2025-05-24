import { injectable } from "inversify";
import type { User } from "itam-edu-common";
import type { Course } from "../entity";
import { ForbiddenError, type HttpError } from "../../api/errors";
import { Postgres } from "../../infra/postgres";
import { CourseChangelog } from "../changes";
import { CourseStatsRepository } from "../stats";

@injectable()
export class DemoteStaff {
    public constructor(
        protected postgres: Postgres,
        protected changelog: CourseChangelog,
        protected statistics: CourseStatsRepository
    ) {}

    /** Removes staff member. */
    public async invoke(
        actor: User,
        course: Course,
        staffMember: User
    ): Promise<void | HttpError> {
        if (!actor.hasCoursePermission(course.id, "isOwner")) {
            return new ForbiddenError();
        }

        await this.remove(course, staffMember);

        await Promise.allSettled([
            this.changelog.add(actor, course, {
                kind: "user-left",
                role: "staff",
                userId: staffMember.id
            }),
            this.statistics.add("staff", course.id, course.staffIds.length - 1)
        ]);
    }

    /**
     * Removes user from the staff list.
     *
     * @returns `true` if staff member is removed, and `false` otherwise.
     * */
    protected async remove(course: Course, user: User): Promise<boolean> {
        const result = await this.postgres.kysely
            .deleteFrom("userCourses")
            .where("courseId", "=", course.id)
            .where("userId", "=", user.id)
            .where("isStaff", "=", true)
            .executeTakeFirst();
        return result.numDeletedRows > 0n;
    }
}
