import { injectable } from "inversify";
import type { User } from "itam-edu-common";
import type { Course } from "../entity";
import { Postgres } from "../../infra/postgres";
import { ForbiddenError, type HttpError } from "../../api/errors";

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
        return await this.postgres.kysely
            .selectFrom("userCourses")
            .innerJoin("users", "userCourses.userId", "users.id")
            .select([
                "users.id",
                "firstName",
                "lastName",
                "patronim",
                "bio",
                "avatar",
                "tgUsername",
                "userCourses.courseId"
            ])
            .where("userCourses.isStaff", "=", false)
            .where("userCourses.courseId", "=", course.id)
            .orderBy("tgUsername asc")
            .execute();
    }
}

export type StudentDto = {
    id: string;
    firstName: string;
    lastName: string | null;
    patronim: string | null;
    bio: string | null;
    avatar: string | null;
    tgUsername: string;
    courseId: string;
};
