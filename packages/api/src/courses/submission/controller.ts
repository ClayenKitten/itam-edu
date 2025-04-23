import { Elysia, t } from "elysia";
import { REQUIRE_TOKEN } from "../../api/plugins/docs";
import { HttpError } from "../../api/errors";
import type { AppContext } from "../../ctx";
import { authenticationPlugin } from "../../api/plugins/authenticate";

export async function submissionController(ctx: AppContext) {
    return new Elysia({
        prefix: "/courses/:course/submissions",
        tags: ["Submissions"]
    })
        .derive(() => ctx)
        .use(authenticationPlugin(ctx))
        .get(
            "",
            async ({ db, user, params, query, error }) => {
                const course = await db.course.getById(params.course);
                if (!course) return error(404);

                const submissions = await db.submissionQuery.getAll(
                    user,
                    course,
                    query
                );
                if (submissions instanceof HttpError) {
                    return error(submissions.code, submissions.message);
                }
                return submissions;
            },
            {
                requireAuthentication: true,
                params: t.Object({ course: t.String({ format: "uuid" }) }),
                query: t.Partial(
                    t.Object({
                        homework: t.String({
                            format: "uuid",
                            description: "Filter by homework."
                        }),
                        student: t.String({
                            format: "uuid",
                            description: "Filter by student."
                        }),
                        accepted: t.Nullable(
                            t.Boolean({
                                description:
                                    "Filter by whether submission was accepted, rejected or is still pending review."
                            })
                        )
                    })
                ),
                detail: {
                    summary: "List homework submissions",
                    description:
                        "Returns all homework submissions of the course after optional filtering.",
                    security: REQUIRE_TOKEN
                }
            }
        )
        .get(
            "/:homework/:student",
            async ({ db, user, params, error }) => {
                const [course, homework, student] = await Promise.all([
                    db.course.getById(params.course),
                    db.homework.getById(params.homework),
                    db.user.getById(params.student)
                ]);
                if (!course || !homework || !student) return error(404);

                const submission = await db.submissionQuery.get(
                    user,
                    course,
                    homework,
                    student
                );
                if (submission instanceof HttpError) {
                    return error(submission.code, submission.message);
                }
                return submission;
            },
            {
                requireAuthentication: true,
                params: t.Object({
                    course: t.String({ format: "uuid" }),
                    homework: t.String({ format: "uuid" }),
                    student: t.String({ format: "uuid" })
                }),
                detail: {
                    summary: "Get homework submission",
                    description: "Returns homework submission.",
                    security: REQUIRE_TOKEN
                }
            }
        )
        .post(
            "/:homework/:student",
            async ({ submission, db, user, params, body, error }) => {
                const [course, homework, student] = await Promise.all([
                    db.course.getById(params.course),
                    db.homework.getById(params.homework),
                    db.user.getById(params.student)
                ]);
                if (!course || !homework || !student) return error(404);
                const result = await submission.sendMessage(
                    user,
                    course,
                    homework,
                    student,
                    body.content,
                    body.accepted
                );
                if (result instanceof HttpError) {
                    return error(result.code, result.message);
                }
            },
            {
                requireAuthentication: true,
                params: t.Object({
                    course: t.String({ format: "uuid" }),
                    homework: t.String({ format: "uuid" }),
                    student: t.String({ format: "uuid" })
                }),
                body: t.Object({
                    content: t.String({ maxLength: 65536 }),
                    accepted: t.Nullable(t.Boolean())
                }),
                detail: {
                    summary: "Submit homework",
                    description: "Creates new homework submission.",
                    security: REQUIRE_TOKEN
                }
            }
        );
}
