import { Elysia, error, t } from "elysia";
import initContext from "../../api/plugins";
import * as schema from "./schema";
import { REQUIRE_TOKEN } from "../../api/plugins/docs";
import { HttpError } from "../../api/errors";

export async function homeworkController<PREFIX extends string>(
    prefix: PREFIX
) {
    return new Elysia({ prefix, tags: ["Homeworks"] })
        .use(initContext())
        .get(
            "",
            async ({ db, params }) => {
                const homeworks = await db.homeworksQuery.getAll(params.course);
                return homeworks;
            },
            {
                params: t.Object({ course: t.String({ format: "uuid" }) }),
                detail: {
                    summary: "List homeworks",
                    description: "Returns all homeworks of the course."
                }
            }
        )
        .post(
            "",
            async ({ db, params, body }) => {
                const homework = await db.homework.create(params.course, body);
                return homework.toDTO();
            },
            {
                hasCoursePermission: ["canEditContent"],
                body: schema.createHomework,
                params: t.Object({ course: t.String({ format: "uuid" }) }),
                detail: {
                    summary: "Create new homework",
                    description: "Creates new homework.",
                    security: REQUIRE_TOKEN
                }
            }
        )
        .put(
            "",
            async ({ db, params, body }) => {
                await db.homework.updateAll(params.course, body.homeworks);
                return "Ok";
            },
            {
                body: t.Object({ homeworks: schema.updateHomeworksList }),
                params: t.Object({ course: t.String({ format: "uuid" }) }),
                hasCoursePermission: "canEditContent",
                detail: {
                    summary: "Update homeworks",
                    description:
                        "Updates homeworks list ordering. If homework is not present, it is deleted.",
                    security: REQUIRE_TOKEN
                }
            }
        )
        .get(
            "/:homework",
            async ({ db, params }) => {
                const homework = await db.homeworksQuery.get(
                    params.course,
                    params.homework
                );
                if (homework instanceof HttpError) {
                    return error(homework.code, homework.message);
                }
                return homework;
            },
            {
                params: t.Object({
                    course: t.String({ format: "uuid" }),
                    homework: t.String({ format: "uuid" })
                }),
                detail: {
                    summary: "Get homework",
                    description: "Returns homework."
                }
            }
        )
        .put(
            "/:homework",
            async ({ db, params, body, error }) => {
                const homework = await db.homework.update(
                    params.homework,
                    body
                );
                if (!homework) return error(404);
                return homework.toDTO();
            },
            {
                params: t.Object({
                    course: t.String({ format: "uuid" }),
                    homework: t.String({ format: "uuid" })
                }),
                body: schema.updateHomework,
                hasCoursePermission: [["canEditContent"], 404],
                detail: {
                    summary: "Update homework",
                    description: "Updates homework.",
                    security: REQUIRE_TOKEN
                }
            }
        );
}
