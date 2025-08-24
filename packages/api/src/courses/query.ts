import { injectable } from "inversify";
import { Postgres } from "itam-edu-core/infra/postgres";
import { LessonQuery, type LessonPartialDTO } from "./lesson/query";
import { HomeworkQuery, type HomeworkPartialDTO } from "./homework/query";
import { CourseStatsRepository } from "./stats";
import { CourseRepository } from "./repository";
import type { CoursePermissions, CourseRole, User } from "itam-edu-common";
import type { CourseDto } from "./schema";
import { type HttpError, NotFoundError } from "../api/errors";

@injectable()
export class CourseQuery {
    public constructor(
        protected postgres: Postgres,
        protected courseRepo: CourseRepository,
        protected lessonQuery: LessonQuery,
        protected homeworkQuery: HomeworkQuery,
        protected statsRepo: CourseStatsRepository
    ) {}

    public async get(
        actor: User | null,
        id: string
    ): Promise<CourseQueryDto | HttpError> {
        const course = await this.courseRepo.getById(id);
        if (course === null) {
            return new NotFoundError("Course not found.");
        }

        const permissions = course.getPermissionsFor(actor);
        if (permissions === null) {
            return new NotFoundError("Course not found.");
        }

        const role = actor ? course.getRoleFor(actor) : null;

        const [lessons, homeworks] = await Promise.all([
            this.lessonQuery.getAll(id),
            this.homeworkQuery.getAll(id)
        ]);
        return {
            ...course.toDTO(),
            role,
            lessons,
            homeworks,
            permissions
        };
    }

    public async getAll(actor: User | null): Promise<CourseQueryPartialDto[]> {
        const courses = await this.courseRepo.getAll();
        let courseQueryDtos = [];
        for (const course of courses) {
            const role = actor ? course.getRoleFor(actor) : null;
            const permissions = course.getPermissionsFor(actor);

            if (permissions === null) continue;
            courseQueryDtos.push({ ...course.toDTO(), role, permissions });
        }
        return courseQueryDtos;
    }
}

export type CourseQueryDto = CourseDto & {
    lessons: LessonPartialDTO[];
    homeworks: HomeworkPartialDTO[];
    role: CourseRole | null;
    permissions: CoursePermissions;
};

export type CourseQueryPartialDto = CourseDto & {
    role: CourseRole | null;
    permissions: CoursePermissions;
};
