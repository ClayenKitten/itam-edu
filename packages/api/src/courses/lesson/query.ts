import { injectable } from "inversify";
import { Postgres } from "../../infra/postgres";
import { CourseRepository } from "../repository";
import type { User } from "itam-edu-common";
import { CourseNotFound, LessonNotFound } from "../errors";

@injectable()
export class LessonQuery {
    public constructor(
        private postgres: Postgres,
        private courseRepo: CourseRepository
    ) {}

    /**
     * Returns a lesson.
     *
     * @throws {CourseNotFound}
     * @throws {LessonNotFound}
     */
    public async get(
        actor: User | null,
        courseId: string,
        lessonId: string
    ): Promise<LessonDTO> {
        const course = await this.courseRepo.getById(courseId);
        const permissions = course?.getPermissionsFor(actor);
        if (!course || !permissions) {
            throw new CourseNotFound(courseId);
        }

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
                "isOnline",
                "scheduledAt"
            ])
            .where("id", "=", lessonId)
            .where("courseId", "=", courseId)
            .executeTakeFirst();
        if (!lesson) {
            throw new LessonNotFound(lessonId);
        }

        const homeworkIds = await this.postgres.kysely
            .selectFrom("lessonHomeworks")
            .innerJoin("homeworks", "homeworks.id", "homeworkId")
            .select("homeworks.id")
            .orderBy("homeworks.position")
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
            homeworkIds: homeworkIds.map(({ id }) => id),
            schedule: lesson.scheduledAt
                ? {
                      date: lesson.scheduledAt,
                      location: lesson.location,
                      isOnline: lesson.isOnline ?? false
                  }
                : null
        };
    }

    /**
     * Returns all lessons is course.
     *
     * @throws {CourseNotFound}
     */
    public async getAll(
        actor: User | null,
        courseId: string
    ): Promise<LessonPartialDTO[]> {
        const course = await this.courseRepo.getById(courseId);
        const permissions = course?.getPermissionsFor(actor);
        if (!course || !permissions) {
            throw new CourseNotFound(courseId);
        }

        const lessons = await this.postgres.kysely
            .selectFrom("lessons")
            .select([
                "id",
                "courseId",
                "position",
                "title",
                "video",
                "banner",
                "createdAt",
                "location",
                "isOnline",
                "scheduledAt"
            ])
            .where("courseId", "=", courseId)
            .orderBy("position")
            .execute();
        return lessons.map(l => ({
            id: l.id,
            courseId: l.courseId,
            position: l.position,
            title: l.title,
            banner: l.banner,
            video: l.video,
            createdAt: l.createdAt,
            schedule: l.scheduledAt
                ? {
                      date: l.scheduledAt,
                      location: l.location,
                      isOnline: l.isOnline ?? false
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
    homeworkIds: string[];
    schedule: LessonScheduleDto | null;
};

export type LessonPartialDTO = {
    id: string;
    courseId: string;
    position: number;
    title: string;
    banner: string | null;
    video: string | null;
    createdAt: Date;
    schedule: LessonScheduleDto | null;
};

export type LessonScheduleDto = {
    date: Date;
    location: string | null;
    isOnline: boolean;
};
