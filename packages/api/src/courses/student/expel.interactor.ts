import { injectable } from "inversify";
import type { Course } from "../entity";
import type { User } from "itam-edu-common";
import {
    ConflictError,
    ForbiddenError,
    HttpError,
    NotFoundError
} from "../../api/errors";
import { CourseStatsRepository } from "../stats";
import { Postgres } from "../../infra/postgres";
import { CourseChangelog } from "../changes";

@injectable()
export class ExpelStudent {
    public constructor(
        protected postgres: Postgres,
        protected changelog: CourseChangelog,
        protected statistics: CourseStatsRepository
    ) {}

    /** Expels student. */
    public async invoke(
        actor: User,
        course: Course,
        student: User
    ): Promise<void | HttpError> {
        const permissions = course.getPermissionsFor(actor);
        if (permissions === null) return new NotFoundError("Course not found.");

        if (actor.id !== student.id && !permissions.students.remove) {
            return new ForbiddenError(
                "You are not allowed to remove students in that course."
            );
        }
        const isRemoved = await this.remove(course, student);
        if (!isRemoved) {
            return new ConflictError("User is not a student of the course.");
        }
        await Promise.allSettled([
            this.changelog.add(actor, course, {
                kind: "user-left",
                role: "student",
                userId: student.id
            }),
            this.statistics.add("students", course.id, course.studentCount - 1)
        ]);
    }

    /**
     * Removes user from the student list.
     *
     * @returns `true` if student is removed, and `false` otherwise.
     * */
    protected async remove(course: Course, user: User): Promise<boolean> {
        const result = await this.postgres.kysely
            .deleteFrom("userCourses")
            .where("courseId", "=", course.id)
            .where("userId", "=", user.id)
            .where("userCourses.role", "=", "student")
            .executeTakeFirst();
        return result.numDeletedRows > 0n;
    }
}
