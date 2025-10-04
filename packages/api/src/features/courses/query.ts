import { injectable } from "inversify";
import { LessonQuery, type LessonPartialDTO } from "./lesson/query";
import { HomeworkQuery, type HomeworkPartialDTO } from "./homework/query";
import { CourseRepository } from "./repository";
import type { CoursePermissions, CourseRole, User } from "itam-edu-common";
import type { CourseDto } from "./schema";
import { HttpError, NotFoundError } from "../../api/errors";

@injectable()
export class CourseQuery {
    public constructor(
        private courseRepo: CourseRepository,
        private lessonQuery: LessonQuery,
        private homeworkQuery: HomeworkQuery
    ) {}

    public async get(
        actor: User | null,
        id: string
    ): Promise<CourseQueryDto | HttpError> {
        const course = await this.courseRepo.getById(id);
        const permissions = course?.getPermissionsFor(actor);
        if (!course || !permissions) {
            return new NotFoundError("Course not found.");
        }

        const role = actor ? course.getRoleFor(actor) : null;
        const [lessons, homeworks] = await Promise.all([
            this.lessonQuery.getAll(actor, id),
            this.homeworkQuery.getAll(actor, id)
        ]);

        if (lessons instanceof HttpError) {
            return lessons;
        }
        if (homeworks instanceof HttpError) {
            return homeworks;
        }

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
        const courseQueryDtos = [];
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
