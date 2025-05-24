import { injectable } from "inversify";
import type { Course } from "../entity";
import type { CoursePermissions, User } from "itam-edu-common";
import { ForbiddenError, HttpError } from "../../api/errors";
import { Postgres } from "../../infra/postgres";
import { CourseChangelog } from "../changes";
import { CourseStatsRepository } from "../stats";

@injectable()
export class PromoteStaff {
    public constructor(
        protected postgres: Postgres,
        protected changelog: CourseChangelog,
        protected statistics: CourseStatsRepository
    ) {}

    /** Promotes staff member. */
    public async invoke(
        actor: User,
        course: Course,
        staffMember: User,
        title: string | null,
        permissions: CoursePermissions
    ): Promise<void | HttpError> {
        if (!actor.hasCoursePermission(course.id, "isOwner")) {
            return new ForbiddenError();
        }

        await this.set(course, staffMember, title, permissions);

        if (!course.staffIds.includes(staffMember.id)) {
            await Promise.allSettled([
                this.changelog.add(actor, course, {
                    kind: "user-joined",
                    role: "staff",
                    userId: staffMember.id
                }),
                this.statistics.add(
                    "staff",
                    course.id,
                    course.staffIds.length + 1
                )
            ]);
        }
    }

    /* Adds user to the staff members list or updates their permissions and title. */
    protected async set(
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
            .executeTakeFirst();
    }
}
