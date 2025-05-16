import { injectable } from "inversify";
import { Postgres } from "../../infra/postgres";
import type { DB, LessonHomeworks } from "itam-edu-db";
import { sql } from "kysely";
import type { ExpressionBuilder, Selectable } from "kysely";
import { Lesson, type LessonSchedule } from "./entity";
import type { Course } from "../entity";

@injectable()
export class LessonRepository {
    public constructor(protected postgres: Postgres) {}

    public async getById(lessonId: string): Promise<Lesson | null> {
        const lesson = await this.postgres.kysely
            .selectFrom("lessons")
            .selectAll()
            .orderBy("position asc")
            .where("id", "=", lessonId)
            .executeTakeFirst();
        if (!lesson) return null;

        const homeworks = await this.postgres.kysely
            .selectFrom("lessonHomeworks")
            .selectAll()
            .where("lessonId", "=", lesson.id)
            .orderBy("position")
            .execute();

        return this.toEntity(lesson, homeworks);
    }

    public async getAll(courseId: string): Promise<Lesson[]> {
        const lessons = await this.postgres.kysely
            .selectFrom("lessons")
            .selectAll()
            .orderBy("position asc")
            .where("courseId", "=", courseId)
            .execute();

        let homeworks: Selectable<LessonHomeworks>[] = [];
        if (lessons.length > 0) {
            homeworks = await this.postgres.kysely
                .selectFrom("lessonHomeworks")
                .selectAll()
                .where(
                    "lessonId",
                    "in",
                    lessons.map(l => l.id)
                )
                .orderBy("position")
                .execute();
        }

        return lessons.map(l =>
            this.toEntity(
                l,
                homeworks.filter(h => h.lessonId === l.id)
            )
        );
    }

    /** Creates or updates the lesson in the database. */
    public async set(lesson: Lesson) {
        const selectPosition = (eb: ExpressionBuilder<DB, "lessons">) => {
            return eb
                .selectFrom("lessons")
                .where("courseId", "=", lesson.courseId)
                .select(eb =>
                    eb.fn
                        .coalesce(
                            eb(
                                eb.fn
                                    .max<number>("position")
                                    .filterWhere(
                                        "courseId",
                                        "=",
                                        lesson.courseId
                                    ),
                                "+",
                                eb.val(1)
                            ),
                            eb.lit(0)
                        )
                        .as("position")
                );
        };

        await this.postgres.kysely.transaction().execute(async trx => {
            await trx
                .insertInto("lessons")
                .values({
                    id: lesson.id,
                    courseId: lesson.courseId,
                    title: lesson.info.title,
                    description: lesson.info.description,
                    banner: lesson.info.banner,
                    video: lesson.info.video,
                    content: lesson.content,
                    isOnline: lesson.schedule?.online !== null,
                    isOffline: lesson.schedule?.offline !== null,
                    location: lesson.schedule?.offline?.location ?? null,
                    scheduledAt: lesson.schedule?.date ?? null,
                    position: eb => selectPosition(eb)
                })
                .onConflict(cb =>
                    cb.column("id").doUpdateSet({
                        courseId: lesson.courseId,
                        title: lesson.info.title,
                        description: lesson.info.description,
                        banner: lesson.info.banner,
                        video: lesson.info.video,
                        content: lesson.content,
                        isOnline: lesson.schedule?.online !== null,
                        isOffline: lesson.schedule?.offline !== null,
                        location: lesson.schedule?.offline?.location ?? null,
                        scheduledAt: lesson.schedule?.date ?? null
                    })
                )
                .execute();

            await trx
                .deleteFrom("lessonHomeworks")
                .where("lessonId", "=", lesson.id)
                .execute();
            if (lesson.homeworks.length > 0) {
                await trx
                    .insertInto("lessonHomeworks")
                    .values(
                        lesson.homeworks.map((h, i) => ({
                            homeworkId: h,
                            lessonId: lesson.id,
                            position: i
                        }))
                    )
                    .execute();
            }
        });
    }

    private toEntity(
        lesson: Selectable<DB["lessons"]>,
        lessonHomeworks: Selectable<DB["lessonHomeworks"]>[]
    ) {
        let schedule: LessonSchedule | null = null;
        if (lesson.scheduledAt) {
            schedule = {
                date: lesson.scheduledAt,
                online: lesson.isOnline ? {} : null,
                offline: lesson.isOffline ? { location: lesson.location } : null
            };
        }

        return new Lesson(
            lesson.id,
            lesson.courseId,
            {
                title: lesson.title,
                description: lesson.description,
                banner: lesson.banner,
                video: lesson.video
            },
            lesson.content,
            lessonHomeworks.map(x => x.homeworkId),
            schedule
        );
    }

    public async updateAll(course: Course, lessonIds: string[]) {
        await this.postgres.kysely.transaction().execute(async trx => {
            await trx
                .deleteFrom("lessonHomeworks")
                .using("lessons")
                .whereRef("lessons.id", "=", "lessonHomeworks.lessonId")
                .where("lessons.courseId", "=", course.id)
                .$if(lessonIds.length > 0, cb =>
                    cb.where("lessons.id", "not in", lessonIds)
                )
                .execute();
            await trx
                .deleteFrom("lessons")
                .where("courseId", "=", course.id)
                .$if(lessonIds.length > 0, cb =>
                    cb.where("id", "not in", lessonIds)
                )
                .execute();

            await sql`SET CONSTRAINTS ALL DEFERRED`.execute(trx);
            let position = 0;
            for (const lessonId of lessonIds) {
                await trx
                    .updateTable("lessons")
                    .where("courseId", "=", course.id)
                    .where("lessons.id", "=", lessonId)
                    .set({ position })
                    .executeTakeFirstOrThrow();
                position += 1;
            }
        });
    }
}
