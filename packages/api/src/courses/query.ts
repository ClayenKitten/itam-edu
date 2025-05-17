import { injectable } from "inversify";
import { Postgres } from "../infra/postgres";
import { LessonQuery, type LessonPartialDTO } from "./lesson/query";
import { HomeworkQuery, type HomeworkPartialDTO } from "./homework/query";

@injectable()
export class CourseQuery {
    public constructor(
        protected postgres: Postgres,
        protected lessonQuery: LessonQuery,
        protected homeworkQuery: HomeworkQuery
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
                "banner",
                "logo",
                "about",
                "colorPrimary",
                "colorOnPrimary",
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
}

export type CourseDTO = {
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
    colorPrimary: string | null;
    colorOnPrimary: string | null;
    isPublished: boolean;
    isEnrollmentOpen: boolean;
    isArchived: boolean;
    lessons: LessonPartialDTO[];
    homeworks: HomeworkPartialDTO[];
};
