import { injectable } from "inversify";
import { Postgres } from "../../infra/postgres";
import { NotFoundError, UnauthorizedError } from "../../api/errors";
import type { User } from "itam-edu-common";
import type { Course } from "../entity";
import type Homework from "../homework/entity";

@injectable()
export class SubmissionQuery {
    public constructor(protected postgres: Postgres) {}

    public async get(
        actor: User,
        course: Course,
        homework: Homework,
        student: User
    ): Promise<SubmissionDTO | NotFoundError> {
        if (
            !actor.isCourseStaff(course.id) &&
            !actor.isCourseStudent(course.id)
        )
            return new NotFoundError();
        const messages = await this.postgres.kysely
            .selectFrom("homeworkSubmissionMessages as msg")
            .select([
                "msg.id",
                "msg.userId",
                "msg.content",
                "msg.accepted",
                "msg.sentAt"
            ])
            .innerJoin("homeworks", "homeworkId", "homeworks.id")
            .where("homeworks.courseId", "=", course.id)
            .where("msg.homeworkId", "=", homework.id)
            .where("msg.studentId", "=", student.id)
            .orderBy("msg.sentAt asc")
            .execute();
        const userIds = new Set(
            messages.map(m => m.userId).filter(u => u !== null)
        );
        const users =
            userIds.size === 0
                ? []
                : await this.postgres.kysely
                      .selectFrom("users")
                      .select([
                          "id",
                          "avatar",
                          "firstName",
                          "lastName",
                          "tgUsername"
                      ])
                      .where("id", "in", Array.from(userIds))
                      .execute();

        return {
            studentId: student.id,
            homeworkId: homework.id,
            accepted: null,
            users,
            messages
        };
    }

    public async getAll(
        actor: User,
        course: Course,
        filters?: {
            homework?: string;
            student?: string;
            accepted?: boolean | null;
        }
    ): Promise<SubmissionPartialDTO[] | UnauthorizedError> {
        if (
            !actor.isCourseStaff(course.id) &&
            !actor.isCourseStudent(course.id)
        )
            return new UnauthorizedError();
        const submissions = await this.postgres.kysely
            .selectFrom("homeworkSubmissions")
            .innerJoin("homeworks", "homeworkId", "homeworks.id")
            .innerJoin("users", "studentId", "users.id")
            .select([
                "users.id as studentId",
                "users.avatar",
                "users.firstName",
                "users.lastName",
                "users.tgUsername",
                "homeworks.id as homeworkId",
                "homeworks.title as homeworkTitle",
                "homeworkSubmissions.accepted"
            ])
            .orderBy("lastMessageAt desc")
            .where("courseId", "=", course.id)
            .$if(filters?.homework !== undefined, qb =>
                qb.where("homeworks.id", "=", filters?.homework!)
            )
            .$if(filters?.student !== undefined, qb =>
                qb.where("users.id", "=", filters?.student!)
            )
            .$if(filters?.accepted !== undefined, qb =>
                qb.where(
                    "homeworkSubmissions.accepted",
                    "is not distinct from",
                    filters?.accepted!
                )
            )
            .orderBy("lastMessageAt asc")
            .execute();
        return submissions.map(s => ({
            homework: { id: s.homeworkId, title: s.homeworkTitle },
            student: {
                id: s.studentId,
                avatar: s.avatar,
                firstName: s.firstName,
                lastName: s.lastName,
                tgUsername: s.tgUsername
            },
            accepted: s.accepted
        }));
    }
}

export type SubmissionDTO = {
    homeworkId: string;
    studentId: string;
    accepted: boolean | null;
    messages: {
        id: string;
        userId: string | null;
        content: string;
        accepted: boolean | null;
        sentAt: Date;
    }[];
    /** Users that took part in the discussion. */
    users: {
        id: string;
        avatar: string | null;
        firstName: string | null;
        lastName: string | null;
        tgUsername: string;
    }[];
};

export type SubmissionPartialDTO = {
    homework: {
        id: string;
        title: string;
    };
    student: {
        id: string;
        avatar: string | null;
        firstName: string | null;
        lastName: string | null;
        tgUsername: string;
    };
    accepted: boolean | null;
};
