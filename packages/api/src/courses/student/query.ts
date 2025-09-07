import { injectable } from "inversify";
import type { User } from "itam-edu-common";
import { Postgres } from "../../infra/postgres";
import {
    ForbiddenError,
    NotFoundError,
    type HttpError
} from "../../api/errors";
import type { StudentDto, StudentRole } from "./schema";
import { CourseRepository } from "../repository";

@injectable()
export class StudentQuery {
    public constructor(
        private postgres: Postgres,
        private courseRepo: CourseRepository
    ) {}

    /** Returns all enrolled students. */
    public async getAll(
        actor: User,
        courseId: string
    ): Promise<StudentDto[] | HttpError> {
        const course = await this.courseRepo.getById(courseId);
        const permissions = course?.getPermissionsFor(actor);
        if (!course || !permissions) {
            return new NotFoundError("Course not found.");
        }
        if (permissions.students.view !== true) {
            return new ForbiddenError("Your are not allowed to view students.");
        }

        const data = await this.postgres.kysely
            .selectFrom("userCourses")
            .innerJoin("users", "userCourses.userId", "users.id")
            .select([
                "users.id",
                "users.firstName",
                "users.lastName",
                "users.bio",
                "users.avatar",
                "users.tgUsername",
                "userCourses.courseId",
                "userCourses.role"
            ])
            .where("userCourses.courseId", "=", course.id)
            .where("userCourses.role", "=", "student")
            .$narrowType<{ role: StudentRole }>()
            .orderBy("users.tgUsername", "asc")
            .execute();
        return data;
    }
}
