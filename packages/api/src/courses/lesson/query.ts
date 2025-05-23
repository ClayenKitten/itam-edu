import { injectable } from "inversify";
import { Postgres } from "../../infra/postgres";
import { NotFoundError } from "../../api/errors";

@injectable()
export class LessonQuery {
    public constructor(protected postgres: Postgres) {}

    public async get(
        courseId: string,
        lessonId: string
    ): Promise<LessonDTO | NotFoundError> {
        const lesson = await this.postgres.kysely
            .selectFrom("lessons")
            .select([
                "id",
                "courseId",
                "title",
                "description",
                "content",
                "banner",
                "video",
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

        const homeworks = await this.postgres.kysely
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
            video: lesson.video,
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
        const lessons = await this.postgres.kysely
            .selectFrom("lessons")
            .select([
                "id",
                "courseId",
                "title",
                "video",
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
            video: l.video,
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
    video: string | null;
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
    video: string | null;
    createdAt: Date;
    schedule: LessonScheduleDTO | null;
};

export type CreateLessonDTO = Omit<LessonDTO, "id" | "position" | "createdAt">;

export type LessonScheduleDTO = {
    date: Date;
    online: {} | null;
    offline: {
        location: string | null;
    } | null;
};
