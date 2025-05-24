import { injectable } from "inversify";
import type { Course } from "../entity";
import type { User } from "itam-edu-common";
import {
    BadRequestError,
    ConflictError,
    ForbiddenError,
    HttpError
} from "../../api/errors";
import { Postgres } from "../../infra/postgres";
import { CourseChangelog } from "../changes";
import { CourseStatsRepository } from "../stats";

@injectable()
export class EnrollStudent {
    public constructor(
        protected postgres: Postgres,
        protected changelog: CourseChangelog,
        protected statistics: CourseStatsRepository
    ) {}

    /** Enrolls student. */
    public async invoke(
        actor: User,
        course: Course,
        student: User
    ): Promise<void | HttpError> {
        if (actor.id !== student.id && !actor.isCourseStaff(course.id)) {
            return new ForbiddenError();
        }
        if (!course.canEnrollStudents) {
            return new BadRequestError("Course doesn't accept enrollments");
        }
        const isAdded = await this.set(course, student);
        if (!isAdded) {
            return new ConflictError("User is already enrolled to the course.");
        }
        await Promise.allSettled([
            this.changelog.add(actor, course, {
                kind: "user-joined",
                role: "student",
                userId: student.id
            }),
            this.statistics.add(
                "students",
                course.id,
                course.studentIds.length + 1
            )
        ]);
    }

    /**
     * Adds user to the student list.
     *
     * @returns `true` if student is added, and `false` if it was already in the list.
     * */
    protected async set(course: Course, user: User): Promise<boolean> {
        const result = await this.postgres.kysely
            .insertInto("userCourses")
            .values({ courseId: course.id, userId: user.id, isStaff: false })
            .onConflict(cb => cb.doNothing())
            .executeTakeFirst();
        return (result.numInsertedOrUpdatedRows ?? 0) > 0n;
    }
}
