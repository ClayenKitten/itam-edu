import { injectable } from "inversify";
import { Postgres } from "../../infra/postgres";
import { HttpError, NotFoundError } from "../../api/errors";
import { CourseRepository } from "../repository";
import type { User } from "itam-edu-common";

@injectable()
export class HomeworkQuery {
    public constructor(
        private postgres: Postgres,
        private courseRepo: CourseRepository
    ) {}

    public async get(
        actor: User | null,
        courseId: string,
        homeworkId: string
    ): Promise<HomeworkDTO | HttpError> {
        const course = await this.courseRepo.getById(courseId);
        const permissions = course?.getPermissionsFor(actor);
        if (!course || !permissions) {
            return new NotFoundError("Course does not exist.");
        }

        const homework = await this.postgres.kysely
            .selectFrom("homeworks")
            .select([
                "id",
                "courseId",
                "title",
                "content",
                "position",
                "deadline",
                "acceptingSubmissionsOverride",
                "createdAt"
            ])
            .where("id", "=", homeworkId)
            .where("courseId", "=", courseId)
            .executeTakeFirst();
        if (!homework) return new NotFoundError();

        const lessons = await this.postgres.kysely
            .selectFrom("lessonHomeworks")
            .innerJoin("lessons", "lessons.id", "lessonId")
            .select(["lessons.id as id", "lessons.title"])
            .orderBy("lessons.position")
            .where("homeworkId", "=", homework.id)
            .execute();

        return {
            id: homework.id,
            courseId: homework.courseId,
            title: homework.title,
            content: homework.content,
            position: homework.position,
            createdAt: homework.createdAt,
            deadline: homework.deadline,
            deadlineOverride: homework.acceptingSubmissionsOverride,
            lessons
        };
    }

    public async getAll(
        actor: User | null,
        courseId: string
    ): Promise<HomeworkPartialDTO[] | HttpError> {
        const course = await this.courseRepo.getById(courseId);
        const permissions = course?.getPermissionsFor(actor);
        if (!course || !permissions) {
            return new NotFoundError("Course does not exist.");
        }

        const homeworks = await this.postgres.kysely
            .selectFrom("homeworks")
            .select([
                "id",
                "courseId",
                "title",
                "position",
                "deadline",
                "acceptingSubmissionsOverride",
                "createdAt"
            ])
            .where("courseId", "=", courseId)
            .orderBy("position")
            .execute();
        return homeworks.map(
            h =>
                ({
                    id: h.id,
                    courseId: h.courseId,
                    title: h.title,
                    position: h.position,
                    createdAt: h.createdAt,
                    deadline: h.deadline,
                    deadlineOverride: h.acceptingSubmissionsOverride
                }) satisfies HomeworkPartialDTO
        );
    }
}

export type HomeworkDTO = {
    id: string;
    courseId: string;
    title: string;
    position: number;
    deadline: Date | null;
    deadlineOverride: boolean | null;
    createdAt: Date;
    content: string | null;
    lessons: {
        id: string;
        title: string;
    }[];
};

export type HomeworkPartialDTO = {
    id: string;
    courseId: string;
    title: string;
    position: number;
    deadline: Date | null;
    deadlineOverride: boolean | null;
    createdAt: Date;
};

export type CreateHomeworkDTO = Omit<
    HomeworkDTO,
    "id" | "courseId" | "position" | "createdAt"
>;

export type LessonScheduleDTO = {
    date: Date;
    online: {} | null;
    offline: {
        location: string | null;
    } | null;
};
