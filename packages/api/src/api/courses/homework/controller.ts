import { Elysia, t } from "elysia";
import initContext from "../../plugins";
import * as schema from "./schema";

export async function homeworkController<PREFIX extends string>(
    prefix: PREFIX
) {
    return new Elysia({ prefix, tags: ["Homework"] }).use(initContext()).group(
        "",
        {
            params: t.Object(
                { course: t.String({ format: "uuid" }) },
                { additionalProperties: true }
            )
        },
        courseApp =>
            courseApp
                .patch(
                    "/submission/:submission",
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
                        params: t.Object(
                            {
                                submission: t.String({ format: "uuid" })
                            },
                            { additionalProperties: true }
                        )
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
                        params: t.Object({}, { additionalProperties: true })
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
                        params: t.Object(
                            { submission: t.String({ format: "uuid" }) },
                            { additionalProperties: true }
                        )
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
                        params: t.Object({}, { additionalProperties: true }),
                        query: t.Object({
                            reviewed: t.Optional(t.Nullable(t.Boolean())),
                            homework: t.Optional(t.String({ format: "uuid" })),
                            student: t.Optional(t.String({ format: "uuid" }))
                        })
                    }
                )

                .get(
                    "",
                    async ({ db, user, params, error }) => {
                        return await db.homework.getAllHomeworks(
                            user.id,
                            params.course
                        );
                    },
                    {
                        requireAuthentication: true,
                        params: t.Object({}, { additionalProperties: true })
                    }
                )

                .post(
                    "",
                    async ({ db, user, params, body, error }) => {
                        return await db.homework.createHomework(
                            user.id,
                            params.course,
                            body
                        );
                    },
                    {
                        hasCoursePermission: [["canEditContent"], 404],
                        body: schema.createHomework,
                        params: t.Object({}, { additionalProperties: true })
                    }
                )

                .group(
                    "/:homework",
                    {
                        params: t.Object(
                            { homework: t.String({ format: "uuid" }) },
                            { additionalProperties: true }
                        )
                    },
                    app =>
                        app
                            .put(
                                "",
                                async ({ db, user, params, body, error }) => {
                                    const found =
                                        await db.homework.updateHomework(
                                            user.id,
                                            params.course,
                                            params.homework,
                                            body
                                        );
                                    if (!found) return error(404);
                                    return { success: found };
                                },
                                {
                                    params: t.Object(
                                        {},
                                        { additionalProperties: true }
                                    ),
                                    body: schema.updateHomework,
                                    hasCoursePermission: [
                                        ["canEditContent"],
                                        404
                                    ]
                                }
                            )
                            .get(
                                "",
                                async ({ db, user, params }) => {
                                    return await db.homework.getHomework(
                                        user.id,
                                        params.course,
                                        params.homework
                                    );
                                },
                                {
                                    requireAuthentication: true,
                                    params: t.Object(
                                        {},
                                        { additionalProperties: true }
                                    )
                                }
                            )
                )
    );
}
