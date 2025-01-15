import type { DB } from "itam-edu-db";
import { type Kysely, sql } from "kysely";
import type { TypeOf } from "zod";
import * as schema from "./schema.js";
import type { ExpressionBuilder } from "kysely";
import { HTTPException } from "hono/http-exception";

export default class LessonRepository {
    constructor(private db: Kysely<DB>) {}

    public async get(courseId: string, lessonSlug: string) {
        return await this.db
            .selectFrom("lessons")
            .select([
                "courseId",
                "slug",
                "position",
                "icon",
                "title",
                "content"
            ])
            .where("courseId", "=", courseId)
            .where("slug", "=", lessonSlug)
            .executeTakeFirst();
    }

    public async getAll(courseId: string) {
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
        lesson: TypeOf<(typeof schema)["createLesson"]>
    ) {
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

        const result = await this.db
            .insertInto("lessons")
            .values(eb => ({
                courseId,
                ...lesson,
                position: selectPosition(eb)
            }))
            .executeTakeFirst();

        return result.numInsertedOrUpdatedRows === 1n;
    }

    public async updatePositions(
        courseId: string,
        lessons: TypeOf<(typeof schema)["updateLessonPositions"]>
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
                    console.log(slug, position, numUpdatedRows);
                    throw new HTTPException(400, {
                        message: "all lessons need to be present"
                    });
                }
                position += 1;
            }
        });
    }
}
