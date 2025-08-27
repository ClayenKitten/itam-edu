import { injectable } from "inversify";
import type { User } from "itam-edu-common";
import type { Course } from "../entity";
import { Postgres } from "../../infra/postgres";
import {
    ForbiddenError,
    NotFoundError,
    type HttpError
} from "../../api/errors";
import { sql } from "kysely";
import type { StudentDto, StudentRole } from "./schema";

@injectable()
export class StudentQuery {
    public constructor(protected postgres: Postgres) {}

    /** Returns all enrolled students. */
    public async getAll(
        actor: User,
        course: Course
    ): Promise<StudentDto[] | HttpError> {
        const permissions = course.getPermissionsFor(actor);
        if (permissions === null) {
            return new NotFoundError("Course not found.");
        }
        if (!permissions.students.view) {
            return new ForbiddenError("Your are not allowed to view students.");
        }

        const data = await this.postgres.kysely
            .selectFrom("userCourses")
            .innerJoin("users", "userCourses.userId", "users.id")
            .leftJoin(
                "submissionAttempts",
                "users.id",
                "submissionAttempts.studentId"
            )
            .leftJoin(
                "submissionReviews",
                "submissionAttempts.id",
                "submissionReviews.attemptId"
            )
            .select([
                "users.id",
                "users.firstName",
                "users.lastName",
                "users.bio",
                "users.avatar",
                "users.tgUsername",
                "userCourses.courseId",
                "userCourses.role",
                // TODO: incorrectly counts reviews and attempts
                sql<number>`count(submission_reviews.*) FILTER (WHERE course_id = ${course.id} AND accepted = true)::INTEGER`.as(
                    "acceptedSubmissions"
                ),
                sql<number>`count(submission_reviews.*) FILTER (WHERE course_id = ${course.id} AND accepted = false)::INTEGER`.as(
                    "rejectedSubmissions"
                ),
                sql<number>`count(submission_attempts.*) FILTER (WHERE course_id = ${course.id})::INTEGER`.as(
                    "totalSubmissions"
                )
            ])
            .where("userCourses.courseId", "=", course.id)
            .where("userCourses.role", "=", "student")
            .$narrowType<{ role: StudentRole }>()
            .groupBy([
                "users.id",
                "users.firstName",
                "users.lastName",
                "users.bio",
                "users.avatar",
                "users.tgUsername",
                "userCourses.courseId",
                "userCourses.role"
            ])
            .orderBy("users.tgUsername", "asc")
            .execute();
        return data;
    }
}
