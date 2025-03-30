import { Elysia, error, t } from "elysia";
import initContext from "../../api/plugins";
import * as schema from "./schema";
import { REQUIRE_TOKEN } from "../../api/plugins/docs";

export async function submissionController<PREFIX extends string>(
    prefix: PREFIX
) {
    return new Elysia({ prefix, tags: ["Submissions"] })
        .use(initContext())
        .get(
            "",
            async ({ db, user, params, query }) => {
                if (!user.isCourseStaff(params.course)) {
                    query.student = user.id;
                }
                const submissions = await db.submission.getAll(
                    params.course,
                    query
                );
                return submissions.map(s => s.toDTO());
            },
            {
                requireAuthentication: true,
                params: t.Object({ course: t.String({ format: "uuid" }) }),
                query: t.Object({
                    reviewed: t.Optional(
                        t.Boolean({
                            description:
                                "Filter by whether submission was reviewed"
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
                            description: "Filter by student"
                        })
                    )
                }),
                detail: {
                    summary: "List homework submissions",
                    description:
                        "Returns all homework submissions of the course after optional filtering.",
                    security: REQUIRE_TOKEN
                }
            }
        )
        .post(
            "",
            async ({ db, user, params, body }) => {
                const submission = await db.submission.create(
                    params.course,
                    user.id,
                    body
                );
                if (submission === null) return error(404);
                return submission.toDTO();
            },
            {
                requireAuthentication: true,
                body: schema.createSubmission,
                params: t.Object({ course: t.String({ format: "uuid" }) }),
                detail: {
                    summary: "Submit homework",
                    description: "Creates new homework submission.",
                    security: REQUIRE_TOKEN
                }
            }
        )
        .get(
            "/:submission",
            async ({ db, user, params, error }) => {
                const submission = await db.submission.getById(
                    params.course,
                    params.submission
                );
                if (submission === null) return error(404);
                if (
                    submission.info.student !== user.id &&
                    !user.isCourseStaff(params.course)
                ) {
                    return error(404);
                }
                return submission.toDTO();
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
                    security: REQUIRE_TOKEN
                }
            }
        )
        .put(
            "/:submission/review",
            async ({ db, user, params, body }) => {
                return await db.submission.review(
                    user.id,
                    params.course,
                    params.submission,
                    body
                );
            },
            {
                hasCoursePermission: [["canEditContent"], 403],
                body: schema.createSubmissionReview,
                params: t.Object({
                    course: t.String({ format: "uuid" }),
                    submission: t.String({ format: "uuid" })
                }),
                detail: {
                    summary: "Review submission",
                    description: "Creates or updates submission review.",
                    security: REQUIRE_TOKEN
                }
            }
        );
}
