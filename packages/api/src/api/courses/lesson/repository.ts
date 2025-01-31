import { Repository } from "../../../db/repository";
import type { DB } from "itam-edu-db";
import { sql } from "kysely";
import * as schema from "./schema";
import type { ExpressionBuilder } from "kysely";
import { schemaFields } from "../../../util";
import { error } from "elysia";

export default class LessonRepository extends Repository {
    public async get(
        courseId: string,
        lessonSlug: string
    ): Promise<typeof schema.lesson.static | null> {
        const lesson = await this.db
            .selectFrom("lessons")
            .select(schemaFields(schema.lesson))
            .where("courseId", "=", courseId)
            .where("slug", "=", lessonSlug)
            .executeTakeFirst();
        return lesson ?? null;
    }

    public async getAll(
        courseId: string
    ): Promise<(typeof schema.lessonWithoutContent.static)[]> {
        const lessons = await this.db
            .selectFrom("lessons")
            .select(["courseId", "slug", "position", "icon", "title"])
            .where("courseId", "=", courseId)
            .orderBy("position asc")
            .execute();
        return lessons;
    }

    public async create(
        courseId: string,
        lesson: typeof schema.createLesson.static
    ): Promise<typeof schema.lesson.static | null> {
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

        const newLesson = await this.db
            .insertInto("lessons")
            .values(eb => ({
                courseId,
                ...lesson,
                position: selectPosition(eb)
            }))
            .returning(schemaFields(schema.lesson))
            .executeTakeFirst();

        return newLesson ?? null;
    }

    public async updatePositions(
        courseId: string,
        lessons: typeof schema.updateLessonPositions.static
    ) {
        await this.db.transaction().execute(async trx => {
            await sql`SET CONSTRAINTS ALL DEFERRED`.execute(trx);

            let position = 0;
            for (const slug of lessons) {
                const { numUpdatedRows } = await trx
                    .updateTable("lessons")
                    .where("courseId", "=", courseId)
                    .where("lessons.slug", "=", slug)
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
