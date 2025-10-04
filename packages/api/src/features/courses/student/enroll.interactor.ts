import { injectable } from "inversify";
import type { Course } from "../entity";
import type { User } from "itam-edu-common";
import {
    BadRequestError,
    ConflictError,
    ForbiddenError,
    HttpError,
    NotFoundError
} from "../../../api/errors";
import { Postgres } from "../../../infra/postgres";
import { CourseChangelog } from "../changes";
import { StudentCounter } from "../analytics/student-counter";

@injectable()
export class EnrollStudent {
    public constructor(
        private postgres: Postgres,
        private changelog: CourseChangelog,
        private studentCounter: StudentCounter
    ) {}

    /** Enrolls student. */
    public async invoke(
        actor: User,
        course: Course,
        student: User
    ): Promise<void | HttpError> {
        const permissions = course.getPermissionsFor(actor);
        if (permissions === null) return new NotFoundError("Course not found.");

        if (actor.id !== student.id) {
            return new ForbiddenError(
                "You are not allowed to enroll other students."
            );
        }
        if (!course.canEnrollStudents) {
            return new BadRequestError("Course doesn't accept enrollments.");
        }
        const isAdded = await this.add(course, student);
        if (!isAdded) {
            return new ConflictError("User is already enrolled to the course.");
        }
        await Promise.allSettled([
            this.changelog.add(actor, course, {
                kind: "user-joined",
                role: "student",
                userId: student.id
            }),
            this.studentCounter.record(course.id)
        ]);
    }

    /**
     * Adds user to the student list.
     *
     * @returns `true` if student is added, and `false` if it was already in the list.
     * */
    protected async add(course: Course, user: User): Promise<boolean> {
        const result = await this.postgres.kysely
            .insertInto("userCourses")
            .values({ courseId: course.id, userId: user.id, role: "student" })
            .onConflict(cb => cb.doNothing())
            .executeTakeFirst();
        return (result.numInsertedOrUpdatedRows ?? 0) > 0n;
    }
}
