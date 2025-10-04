import { injectable } from "inversify";
import { Postgres } from "../../../infra/postgres";
import Homework from "./entity";
import { sql, type ExpressionBuilder, type Selectable } from "kysely";
import type { DB } from "itam-edu-db";

@injectable()
export class HomeworkRepository {
    public constructor(protected postgres: Postgres) {}

    /** Loads homework from the database. */
    public async load(
        courseId: string,
        homeworkId: string
    ): Promise<Homework | null> {
        const hw = await this.postgres.kysely
            .selectFrom("homeworks")
            .selectAll()
            .where("courseId", "=", courseId)
            .where("id", "=", homeworkId)
            .executeTakeFirst();
        if (!hw) return null;
        return this.toEntity(hw);
    }

    /** Loads all course homeworks from the database. */
    public async loadAll(courseId: string): Promise<Homework[]> {
        const homeworksData = await this.postgres.kysely
            .selectFrom("homeworks")
            .orderBy("position asc")
            .selectAll()
            .where("courseId", "=", courseId)
            .execute();
        const homeworks = homeworksData.map(hw => this.toEntity(hw));
        return homeworks;
    }

    /** Saves homework to the database. */
    public async save(homework: Homework): Promise<void> {
        const nextPositionQuery = (eb: ExpressionBuilder<DB, "homeworks">) => {
            return eb
                .selectFrom("homeworks")
                .where("courseId", "=", homework.courseId)
                .select(eb =>
                    eb(
                        eb.fn.coalesce(
                            eb.fn
                                .max<number>("position")
                                .filterWhere(
                                    "courseId",
                                    "=",
                                    homework.courseId
                                ),
                            eb.lit(0)
                        ),
                        "+",
                        eb.val(1)
                    ).as("position")
                );
        };

        await this.postgres.kysely
            .insertInto("homeworks")
            .values(eb => ({
                id: homework.id,
                courseId: homework.courseId,
                position: nextPositionQuery(eb),
                title: homework.title,
                content: homework.content,
                deadline: homework.deadline,
                acceptingSubmissionsOverride: homework.deadlineOverride
            }))
            .onConflict(oc =>
                oc.column("id").doUpdateSet({
                    title: homework.title,
                    content: homework.content,
                    deadline: homework.deadline,
                    acceptingSubmissionsOverride: homework.deadlineOverride
                })
            )
            .executeTakeFirstOrThrow();
    }

    /** Updates a homework list via reordering and deletion. */
    public async reorder(courseId: string, homeworkIds: string[]) {
        await this.postgres.kysely.transaction().execute(async trx => {
            await trx
                .deleteFrom("lessonHomeworks")
                .using("homeworks")
                .whereRef("homeworks.id", "=", "lessonHomeworks.homeworkId")
                .where("homeworks.courseId", "=", courseId)
                .$if(homeworkIds.length > 0, cb =>
                    cb.where("homeworks.id", "not in", homeworkIds)
                )
                .execute();
            await trx
                .deleteFrom("homeworks")
                .where("courseId", "=", courseId)
                .$if(homeworkIds.length > 0, cb =>
                    cb.where("id", "not in", homeworkIds)
                )
                .execute();

            await sql`SET CONSTRAINTS ALL DEFERRED`.execute(trx);
            let position = 0;
            for (const homeworkId of homeworkIds) {
                await trx
                    .updateTable("homeworks")
                    .where("courseId", "=", courseId)
                    .where("homeworks.id", "=", homeworkId)
                    .set({ position })
                    .executeTakeFirstOrThrow();
                position += 1;
            }
        });
    }

    private toEntity(hw: Selectable<DB["homeworks"]>): Homework {
        return new Homework(
            hw.id,
            hw.courseId,
            hw.title,
            hw.content,
            hw.deadline,
            hw.acceptingSubmissionsOverride,
            hw.createdAt
        );
    }
}
