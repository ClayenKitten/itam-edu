import { Elysia, t } from "elysia";
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
                return await db.homework.getAll(params.course);
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
                return await db.homework.create(params.course, body);
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
                return await db.homework.getById(params.homework);
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
                const found = await db.homework.update(params.homework, body);
                if (!found) return error(404);
                return found;
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
