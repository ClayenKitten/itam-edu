import { Elysia, error, t } from "elysia";
import initContext from "../../api/plugins";
import * as schema from "./schema";
import { DEFAULT_SECURITY } from "../../api/plugins/docs";

export async function homeworkController<PREFIX extends string>(
    prefix: PREFIX
) {
    return new Elysia({ prefix, tags: ["Homeworks"] })
        .use(initContext())
        .get(
            "",
            async ({ db, params }) => {
                const homeworks = await db.homework.getAll(params.course);
                return homeworks.map(h => h.toDTO());
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
                    security: DEFAULT_SECURITY
                }
            }
        )
        .get(
            "/:homework",
            async ({ db, params }) => {
                const homework = await db.homework.getById(params.homework);
                if (!homework) return error(404);
                return homework.toDTO();
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
                    security: DEFAULT_SECURITY
                }
            }
        );
}
