import { injectable } from "inversify";
import { Postgres } from "../infra/postgres";
import { LessonQuery, type LessonPartialDTO } from "./lesson/query";
import { HomeworkQuery, type HomeworkPartialDTO } from "./homework/query";
import { CourseStatsRepository } from "./stats";

@injectable()
export class CourseQuery {
    public constructor(
        protected postgres: Postgres,
        protected lessonQuery: LessonQuery,
        protected homeworkQuery: HomeworkQuery,
        protected statsRepo: CourseStatsRepository
    ) {}

    public async get(id: string): Promise<CourseDTO | null> {
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
                "cover",
                "icon",
                "banner",
                "about",
                "theme",
                "isPublished",
                "isEnrollmentOpen",
                "isArchived"
            ])
            .where("courses.id", "=", id)
            .executeTakeFirst();
        if (!course) return null;
        const [lessons, homeworks] = await Promise.all([
            this.lessonQuery.getAll(id),
            this.homeworkQuery.getAll(id)
        ]);
        return {
            ...course,
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
                "cover",
                "icon",
                "banner",
                "theme",
                "isPublished",
                "isEnrollmentOpen",
                "isArchived"
            ])
            .orderBy("courses.title")
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
    semester: "autumn" | "spring" | null;
    title: string;
    description: string | null;
    status: string | null;
    cover: string | null;
    icon: string | null;
    banner: string | null;
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
    semester: "autumn" | "spring" | null;
    title: string;
    description: string | null;
    cover: string | null;
    icon: string | null;
    banner: string | null;
    theme: string;
    isPublished: boolean;
    isEnrollmentOpen: boolean;
    isArchived: boolean;
};
