import type { Kysely } from "kysely";
import type { DB } from "itam-edu-db";
import { NotFoundError } from "../../api/errors";

export class LessonQuery {
    public constructor(private db: Kysely<DB>) {}

    public async get(
        courseId: string,
        lessonId: string
    ): Promise<LessonDTO | NotFoundError> {
        const lesson = await this.db
            .selectFrom("lessons")
            .select([
                "id",
                "courseId",
                "title",
                "description",
                "content",
                "banner",
                "position",
                "createdAt",
                "location",
                "isOffline",
                "isOnline",
                "scheduledAt"
            ])
            .where("id", "=", lessonId)
            .where("courseId", "=", courseId)
            .executeTakeFirst();
        if (!lesson) return new NotFoundError();

        const homeworks = await this.db
            .selectFrom("lessonHomeworks")
            .innerJoin("homeworks", "homeworks.id", "homeworkId")
            .select([
                "homeworks.id as id",
                "homeworks.title",
                "homeworks.deadline"
            ])
            .orderBy("lessonHomeworks.position")
            .where("lessonId", "=", lesson.id)
            .execute();

        return {
            id: lesson.id,
            courseId: lesson.courseId,
            title: lesson.title,
            description: lesson.description,
            content: lesson.content,
            banner: lesson.banner,
            position: lesson.position,
            createdAt: lesson.createdAt,
            homeworks,
            schedule: lesson.scheduledAt
                ? {
                      date: lesson.scheduledAt,
                      online: lesson.isOnline ? {} : null,
                      offline: lesson.isOffline
                          ? { location: lesson.location }
                          : null
                  }
                : null
        };
    }

    public async getAll(courseId: string): Promise<LessonPartialDTO[]> {
        const lessons = await this.db
            .selectFrom("lessons")
            .select([
                "id",
                "courseId",
                "title",
                "banner",
                "createdAt",
                "location",
                "isOffline",
                "isOnline",
                "scheduledAt"
            ])
            .where("courseId", "=", courseId)
            .orderBy("position")
            .execute();
        return lessons.map(l => ({
            id: l.id,
            courseId: l.courseId,
            title: l.title,
            banner: l.banner,
            createdAt: l.createdAt,
            schedule: l.scheduledAt
                ? {
                      date: l.scheduledAt,
                      online: l.isOnline ? {} : null,
                      offline: l.isOffline ? { location: l.location } : null
                  }
                : null
        }));
    }
}

export type LessonDTO = {
    id: string;
    courseId: string;
    title: string;
    description: string | null;
    banner: string | null;
    position: number;
    createdAt: Date;
    content: string | null;
    homeworks: {
        id: string;
        title: string;
        deadline: Date | null;
    }[];
    schedule: LessonScheduleDTO | null;
};

export type LessonPartialDTO = {
    id: string;
    courseId: string;
    title: string;
    banner: string | null;
    createdAt: Date;
    schedule: LessonScheduleDTO | null;
};

export type CreateLessonDTO = Omit<
    LessonDTO,
    "id" | "courseId" | "position" | "createdAt"
>;

export type LessonScheduleDTO = {
    date: Date;
    online: {} | null;
    offline: {
        location: string | null;
    } | null;
};
