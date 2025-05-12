import { Repository } from "../../db/repository";
import type { DB, LessonHomeworks } from "itam-edu-db";
import { sql } from "kysely";
import * as schema from "./schema";
import type { ExpressionBuilder, Selectable, Updateable } from "kysely";
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
        dto: typeof schema.createLesson.static
    ): Promise<Lesson> {
        const selectPosition = (eb: ExpressionBuilder<DB, "lessons">) => {
            return eb
                .selectFrom("lessons")
                .where("courseId", "=", courseId)
                .select(eb =>
                    eb.fn
                        .coalesce(
                            eb(
                                eb.fn
                                    .max<number>("position")
                                    .filterWhere("courseId", "=", courseId),
                                "+",
                                eb.val(1)
                            ),
                            eb.lit(0)
                        )
                        .as("position")
                );
        };

        return this.db.transaction().execute(async trx => {
            const lesson = await trx
                .insertInto("lessons")
                .values(eb => ({
                    courseId,
                    title: dto.info.title,
                    description: dto.info.description,
                    banner: dto.info.banner,
                    video: dto.info.video,
                    content: dto.content,
                    isOnline: dto.schedule?.online !== null,
                    isOffline: dto.schedule?.offline !== null,
                    location: dto.schedule?.offline?.location ?? null,
                    scheduledAt: dto.schedule?.date ?? null,
                    position: selectPosition(eb)
                }))
                .returningAll()
                .executeTakeFirstOrThrow();

            let homeworks: Selectable<DB["lessonHomeworks"]>[] = [];
            if (dto.homeworks.length > 0) {
                homeworks = await trx
                    .insertInto("lessonHomeworks")
                    .values(
                        dto.homeworks.map((h, i) => ({
                            homeworkId: h,
                            lessonId: lesson.id,
                            position: i
                        }))
                    )
                    .returningAll()
                    .execute();
            }

            return this.toEntity(lesson, homeworks);
        });
    }

    public async update(
        lesson: Lesson,
        change: typeof schema.updateLesson.static
    ): Promise<Lesson | null> {
        return await this.db.transaction().execute(async trx => {
            let update: Updateable<DB["lessons"]> = {};
            if (change.info !== undefined) {
                update.title = change.info.title;
                update.description = change.info.description;
                update.banner = change.info.banner;
                update.video = change.info.video;
            }
            if (change.content !== undefined) {
                update.content = change.content;
            }
            if (change.schedule !== undefined) {
                update.isOnline = change.schedule?.online !== null;
                update.isOffline = change.schedule?.offline !== null;
                update.location = change.schedule?.offline?.location ?? null;
                update.scheduledAt = change.schedule?.date ?? null;
            }
            const newLesson = await trx
                .updateTable("lessons")
                .where("id", "=", lesson.id)
                .set(update)
                .returningAll()
                .executeTakeFirst();
            if (!newLesson) return null;

            let homeworks: Selectable<DB["lessonHomeworks"]>[] = [];
            if (change.homeworks !== undefined) {
                await trx
                    .deleteFrom("lessonHomeworks")
                    .where("lessonId", "=", lesson.id)
                    .execute();
                if (change.homeworks.length > 0) {
                    homeworks = await trx
                        .insertInto("lessonHomeworks")
                        .values(
                            change.homeworks.map((h, i) => ({
                                homeworkId: h,
                                lessonId: lesson.id,
                                position: i
                            }))
                        )
                        .returningAll()
                        .execute();
                }
            }

            return this.toEntity(newLesson, homeworks);
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
                video: lesson.video,
                position: lesson.position,
                createdAt: lesson.createdAt
            },
            lesson.content,
            lessonHomeworks.map(x => x.homeworkId),
            schedule
        );
    }

    public async updateAll(courseId: string, lessonIds: string[]) {
        await this.db.transaction().execute(async trx => {
            await trx
                .deleteFrom("lessonHomeworks")
                .using("lessons")
                .whereRef("lessons.id", "=", "lessonHomeworks.lessonId")
                .where("lessons.courseId", "=", courseId)
                .$if(lessonIds.length > 0, cb =>
                    cb.where("lessons.id", "not in", lessonIds)
                )
                .execute();
            await trx
                .deleteFrom("lessons")
                .where("courseId", "=", courseId)
                .$if(lessonIds.length > 0, cb =>
                    cb.where("id", "not in", lessonIds)
                )
                .execute();

            await sql`SET CONSTRAINTS ALL DEFERRED`.execute(trx);
            let position = 0;
            for (const lessonId of lessonIds) {
                await trx
                    .updateTable("lessons")
                    .where("courseId", "=", courseId)
                    .where("lessons.id", "=", lessonId)
                    .set({ position })
                    .executeTakeFirstOrThrow();
                position += 1;
            }
        });
    }
}
