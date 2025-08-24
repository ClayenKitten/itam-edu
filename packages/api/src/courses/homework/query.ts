import { injectable } from "inversify";
import { Postgres } from "itam-edu-core/infra/postgres";
import { NotFoundError } from "../../api/errors";

@injectable()
export class HomeworkQuery {
    public constructor(protected postgres: Postgres) {}

    public async get(
        courseId: string,
        homeworkId: string
    ): Promise<HomeworkDTO | NotFoundError> {
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

    public async getAll(courseId: string): Promise<HomeworkPartialDTO[]> {
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
