import { Elysia, t } from "elysia";
import initContext from "../../plugins";
import * as schema from "./schema";
import { DEFAULT_SECURITY } from "../../plugins/docs";

export async function homeworkController<PREFIX extends string>(
    prefix: PREFIX
) {
    return new Elysia({ prefix, tags: ["Homeworks"] })
        .use(initContext())
        .get(
            "",
            async ({ db, user, params }) => {
                return await db.homework.getAllHomeworks(
                    user.id,
                    params.course
                );
            },
            {
                requireAuthentication: true,
                params: t.Object({ course: t.String({ format: "uuid" }) }),
                detail: {
                    summary: "List homeworks",
                    description: "Returns all homeworks of the course."
                }
            }
        )
        .post(
            "",
            async ({ db, user, params, body }) => {
                return await db.homework.createHomework(
                    user.id,
                    params.course,
                    body
                );
            },
            {
                hasCoursePermission: [["canEditContent"], 404],
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
            async ({ db, user, params }) => {
                return await db.homework.getHomework(
                    user.id,
                    params.course,
                    params.homework
                );
            },
            {
                requireAuthentication: true,
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
            async ({ db, user, params, body, error }) => {
                const found = await db.homework.updateHomework(
                    user.id,
                    params.course,
                    params.homework,
                    body
                );
                if (!found) return error(404);
                return { success: found };
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
        )
        .get(
            "/submissions",
            async ({ db, user, params, query, error }) => {
                return await db.homework.getSubmissions(
                    user.id,
                    params.course,
                    query
                );
            },
            {
                requireAuthentication: true,
                params: t.Object({ course: t.String({ format: "uuid" }) }),
                query: t.Object({
                    reviewed: t.Optional(
                        t.Boolean({
                            description:
                                "Filter by review status of the homework"
                        })
                    ),
                    homework: t.Optional(
                        t.String({
                            format: "uuid",
                            description: "Filter by homework"
                        })
                    ),
                    student: t.Optional(
                        t.String({
                            format: "uuid",
                            description:
                                "Filter by review status of the submission"
                        })
                    )
                }),
                detail: {
                    summary: "List and filter homework submissions",
                    description:
                        "Returns all homework submissions of the course after optional filtering.",
                    security: DEFAULT_SECURITY
                }
            }
        )
        .post(
            "/submissions",
            async ({ db, user, params, body }) => {
                return await db.homework.createSubmission(
                    user.id,
                    params.course,
                    body
                );
            },
            {
                requireAuthentication: true,
                body: schema.createSubmission,
                params: t.Object({ course: t.String({ format: "uuid" }) }),
                detail: {
                    summary: "Submit homework",
                    description: "Creates new homework submission.",
                    security: DEFAULT_SECURITY
                }
            }
        )
        .get(
            "/submissions/:submission",
            async ({ db, user, params, error }) => {
                return await db.homework.getSubmissionById(
                    user.id,
                    params.course,
                    params.submission
                );
            },
            {
                requireAuthentication: true,
                params: t.Object({
                    course: t.String({ format: "uuid" }),
                    submission: t.String({ format: "uuid" })
                }),
                detail: {
                    summary: "Get homework submission",
                    description: "Returns homework submission.",
                    security: DEFAULT_SECURITY
                }
            }
        )
        .put(
            "/submissions/:submission/review",
            async ({ db, user, params, body }) => {
                return await db.homework.review(
                    user.id,
                    params.course,
                    params.submission,
                    body
                );
            },
            {
                hasCoursePermission: [["canEditContent"], 404],
                body: schema.reviewOfSubmission,
                params: t.Object({
                    course: t.String({ format: "uuid" }),
                    submission: t.String({ format: "uuid" })
                }),
                detail: {
                    summary: "Review submission",
                    description: "Creates or updates submission review.",
                    security: DEFAULT_SECURITY
                }
            }
        );
}
