import { injectable } from "inversify";
import type { User } from "itam-edu-common";
import type { Course } from "../entity";
import { Postgres } from "../../infra/postgres";
import { ForbiddenError, type HttpError } from "../../api/errors";
import { sql } from "kysely";

@injectable()
export class StudentQuery {
    public constructor(protected postgres: Postgres) {}

    /** Returns all enrolled students. */
    public async getAll(
        actor: User,
        course: Course
    ): Promise<StudentDto[] | HttpError> {
        if (!actor.isCourseStaff(course.id)) {
            return new ForbiddenError();
        }
        const data = await this.postgres.kysely
            .selectFrom("userCourses")
            .innerJoin("users", "userCourses.userId", "users.id")
            .leftJoin(
                "homeworkSubmissions",
                "users.id",
                "homeworkSubmissions.studentId"
            )
            .select([
                "users.id",
                "courseId",
                "firstName",
                "lastName",
                "patronim",
                "avatar",
                "tgUsername",
                sql<number>`count(homework_submissions.*) FILTER (WHERE course_id = ${course.id} AND accepted = true)::INTEGER`.as(
                    "acceptedSubmissions"
                ),
                sql<number>`count(homework_submissions.*) FILTER (WHERE course_id = ${course.id} AND accepted = false)::INTEGER`.as(
                    "rejectedSubmissions"
                ),
                sql<number>`count(homework_submissions.*) FILTER (WHERE course_id = ${course.id})::INTEGER`.as(
                    "totalSubmissions"
                )
            ])
            .where("isStaff", "=", sql.lit(false))
            .where("courseId", "=", course.id)
            .groupBy([
                "users.id",
                "courseId",
                "firstName",
                "lastName",
                "patronim",
                "avatar",
                "tgUsername"
            ])
            .orderBy("users.tgUsername", "asc")
            .execute();
        return data as NonNullableProperties<(typeof data)[number]>[];
    }
}

// View properties are mistakenly marked as nullable.
// https://github.com/RobinBlomberg/kysely-codegen/issues/261
type NonNullableProperties<T> = { [P in keyof T]: NonNullable<T[P]> };

export type StudentDto = {
    id: string;
    firstName: string;
    lastName: string | null;
    patronim: string | null;
    avatar: string | null;
    tgUsername: string;
    courseId: string;
    acceptedSubmissions: number;
    totalSubmissions: number;
    rejectedSubmissions: number;
};
