import { injectable } from "inversify";
import type { Course } from "../entity";
import { Postgres } from "../../infra/postgres";

@injectable()
export class StaffQuery {
    public constructor(protected postgres: Postgres) {}

    /** Returns all staff members. */
    public async getAll(course: Course): Promise<StaffDto[]> {
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
                "userCourses.courseId",
                "userCourses.title",
                "userCourses.isOwner",
                "userCourses.canEditInfo",
                "userCourses.canEditContent",
                "userCourses.canManageSubmissions"
            ])
            .where("userCourses.isStaff", "=", true)
            .where("userCourses.courseId", "=", course.id)
            .orderBy("tgUsername asc")
            .execute();
    }
}

export type StaffDto = {
    id: string;
    firstName: string;
    lastName: string | null;
    patronim: string | null;
    bio: string | null;
    avatar: string | null;
    tgUsername: string;
    courseId: string;
    title: string | null;
    isOwner: boolean;
    canEditInfo: boolean;
    canEditContent: boolean;
    canManageSubmissions: boolean;
};
