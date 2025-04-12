import { Repository } from "../../db/repository";
import Homework from "./entity";
import * as schema from "./schema";
import { sql, type ExpressionBuilder, type Selectable } from "kysely";
import type { DB } from "itam-edu-db";

export default class HomeworkRepository extends Repository {
    /** Returns homework by id. */
    public async getById(homeworkId: string): Promise<Homework | null> {
        const hw = await this.db
            .selectFrom("homeworks")
            .selectAll()
            .where("id", "=", homeworkId)
            .executeTakeFirst();
        if (!hw) return null;
        return this.toEntity(hw);
    }

    /** Returns all homeworks of the course. */
    public async getAll(courseId: string): Promise<Homework[]> {
        const homeworksData = await this.db
            .selectFrom("homeworks")
            .orderBy("position asc")
            .selectAll()
            .where("courseId", "=", courseId)
            .execute();
        const homeworks = homeworksData.map(hw => this.toEntity(hw));
        return homeworks;
    }

    /** Creates new homework. */
    public async create(
        courseId: string,
        homeworkInfo: typeof schema.createHomework.static
    ): Promise<Homework> {
        const selectPosition = (eb: ExpressionBuilder<DB, "homeworks">) => {
            return eb
                .selectFrom("homeworks")
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

        const hw = await this.db
            .insertInto("homeworks")
            .values(eb => ({
                title: homeworkInfo.title,
                courseId: courseId,
                position: selectPosition(eb)
            }))
            .returningAll()
            .executeTakeFirstOrThrow();

        return this.toEntity(hw);
    }

    /** Updates a homework. */
    public async update(
        homeworkId: string,
        homeworkInfo: typeof schema.updateHomework.static
    ) {
        const hw = await this.db
            .updateTable("homeworks")
            .where("id", "=", homeworkId)
            .set({
                title: homeworkInfo.title,
                content: homeworkInfo.content,
                deadline: homeworkInfo.deadline,
                acceptingSubmissionsOverride: homeworkInfo.deadlineOverride
            })
            .returningAll()
            .executeTakeFirst();
        if (!hw) return null;
        return this.toEntity(hw);
    }

    /** Updates a homework list via reordering and deletion. */
    public async updateAll(courseId: string, homeworkIds: string[]) {
        await this.db.transaction().execute(async trx => {
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
