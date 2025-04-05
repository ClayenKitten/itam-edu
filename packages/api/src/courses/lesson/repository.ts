import { Repository } from "../../db/repository";
import type { DB, LessonHomeworks } from "itam-edu-db";
import { sql } from "kysely";
import * as schema from "./schema";
import type { ExpressionBuilder, Selectable } from "kysely";
import { error } from "elysia";
import { Lesson, type LessonSchedule } from "./entity";

export default class LessonRepository extends Repository {
    public async getById(lessonId: string): Promise<Lesson | null> {
        const lesson = await this.db
            .selectFrom("lessons")
            .selectAll()
            .orderBy("position asc")
            .where("id", "=", lessonId)
            .executeTakeFirst();
        if (!lesson) return null;

        const homeworks = await this.db
            .selectFrom("lessonHomeworks")
            .selectAll()
            .where("lessonId", "=", lesson.id)
            .orderBy("position")
            .execute();

        return this.toEntity(lesson, homeworks);
    }

    public async getAll(courseId: string): Promise<Lesson[]> {
        const lessons = await this.db
            .selectFrom("lessons")
            .selectAll()
            .orderBy("position asc")
            .where("courseId", "=", courseId)
            .execute();

        let homeworks: Selectable<LessonHomeworks>[] = [];
        if (lessons.length > 0) {
            homeworks = await this.db
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

    public async create(
        courseId: string,
        info: typeof schema.createLesson.static
    ): Promise<Lesson | null> {
        const selectPosition = (eb: ExpressionBuilder<DB, "lessons">) => {
            return eb
                .selectFrom("lessons")
                .where("courseId", "=", courseId)
                .select(eb =>
                    eb(
                        eb.fn.coalesce(
                            eb.fn
                                .max<number>("position")
                                .filterWhere("courseId", "=", courseId),
                            eb.lit(0)
                        ),
                        "+",
                        eb.val(1)
                    ).as("position")
                );
        };

        const lesson = await this.db
            .insertInto("lessons")
            .values(eb => ({
                courseId,
                title: info.title,
                isOnline: info.schedule?.online !== null,
                isOffline: info.schedule?.offline !== null,
                location: info.schedule?.offline?.location ?? null,
                scheduledAt: info.schedule?.date ?? null,
                position: selectPosition(eb)
            }))
            .returningAll()
            .executeTakeFirst();
        if (!lesson) return null;

        return this.toEntity(lesson, []);
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
                position: lesson.position,
                createdAt: lesson.createdAt
            },
            {
                body: lesson.content,
                homeworks: lessonHomeworks.map(x => x.homeworkId)
            },
            schedule
        );
    }

    public async updatePositions(
        courseId: string,
        lessons: typeof schema.updateLessonPositions.static
    ) {
        await this.db.transaction().execute(async trx => {
            await sql`SET CONSTRAINTS ALL DEFERRED`.execute(trx);

            let position = 0;
            for (const lessonId of lessons) {
                const { numUpdatedRows } = await trx
                    .updateTable("lessons")
                    .where("courseId", "=", courseId)
                    .where("lessons.id", "=", lessonId)
                    .set({ position })
                    .executeTakeFirstOrThrow();
                if (numUpdatedRows !== 1n) {
                    throw error(422, "all lessons need to be present");
                }
                position += 1;
            }
        });
    }
}
