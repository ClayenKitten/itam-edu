import { injectable } from "inversify";
import { Postgres } from "../infra/postgres";
import { LessonQuery, type LessonPartialDTO } from "./lesson/query";
import { HomeworkQuery, type HomeworkPartialDTO } from "./homework/query";
import { CourseCache } from "./cache";
import logger from "../logger";

@injectable()
export class CourseQuery {
    public constructor(
        protected postgres: Postgres,
        protected lessonQuery: LessonQuery,
        protected homeworkQuery: HomeworkQuery,
        protected cache: CourseCache
    ) {}

    public async get(id: string): Promise<CourseDTO | null> {
        let cached = await this.cache.get(id);
        if (!cached) {
            const course = await this.postgres.kysely
                .selectFrom("courses")
                .select([
                    "id",
                    "slug",
                    "year",
                    "semester",
                    "title",
                    "description",
                    "status",
                    "banner",
                    "logo",
                    "about",
                    "theme",
                    "isPublished",
                    "isEnrollmentOpen",
                    "isArchived"
                ])
                .where("courses.id", "=", id)
                .executeTakeFirst();
            if (!course) return null;
            await this.cache.set(course);
            cached = course;
        }

        const [lessons, homeworks] = await Promise.all([
            this.lessonQuery.getAll(id),
            this.homeworkQuery.getAll(id)
        ]);
        return {
            ...cached,
            lessons,
            homeworks
        };
    }

    public async getAll(): Promise<CoursePartialDTO[]> {
        const courses = await this.postgres.kysely
            .selectFrom("courses")
            .select([
                "id",
                "slug",
                "year",
                "semester",
                "title",
                "description",
                "banner",
                "logo",
                "theme",
                "isPublished",
                "isEnrollmentOpen",
                "isArchived"
            ])
            .execute();
        return courses;
    }
}

export type CourseDTO = CourseDtoData & {
    lessons: LessonPartialDTO[];
    homeworks: HomeworkPartialDTO[];
};

export type CourseDtoData = {
    id: string;
    slug: string;
    year: number;
    semester: number | null;
    title: string;
    description: string | null;
    status: string | null;
    banner: string | null;
    logo: string | null;
    about: string;
    theme: string;
    isPublished: boolean;
    isEnrollmentOpen: boolean;
    isArchived: boolean;
};

export type CoursePartialDTO = {
    id: string;
    slug: string;
    year: number;
    semester: number | null;
    title: string;
    description: string | null;
    banner: string | null;
    logo: string | null;
    theme: string;
    isPublished: boolean;
    isEnrollmentOpen: boolean;
    isArchived: boolean;
};
