import { Repository } from "../../db/repository";
import Homework from "./entity";
import * as schema from "./schema";
import { type ExpressionBuilder, type Selectable } from "kysely";
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
                acceptingSubmissionsOverride:
                    homeworkInfo.overrideAcceptingSubmissions
            })
            .returningAll()
            .executeTakeFirst();
        if (!hw) return null;
        return this.toEntity(hw);
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
