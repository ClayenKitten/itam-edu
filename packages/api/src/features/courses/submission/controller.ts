import { injectable } from "inversify";
import { Elysia, t } from "elysia";
import { REQUIRE_TOKEN } from "../../../ports/http/openapi";
import { HttpError } from "../../../api/errors";
import { AuthenticationPlugin } from "../../../ports/http/authn";
import { SubmissionQuery } from "./query";
import { ReviewHomework } from "./review.interactor";
import { SubmitHomework } from "./submit.interactor";

@injectable()
export class SubmissionController {
    public constructor(
        private authPlugin: AuthenticationPlugin,
        private submissionQuery: SubmissionQuery,
        private submitInteractor: SubmitHomework,
        private reviewInteractor: ReviewHomework
    ) {}

    public toElysia() {
        return new Elysia({
            prefix: "/courses/:course",
            tags: ["Submissions"]
        })
            .use(this.authPlugin.toElysia())
            .get(
                "/submissions",
                async ({ user, params, query, status }) => {
                    const submissions = await this.submissionQuery.getAll(
                        user,
                        params.course,
                        query
                    );
                    if (submissions instanceof HttpError) {
                        return status(submissions.code, submissions.message);
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
                "/homeworks/:homework/submissions/:student",
                async ({ user, params, status }) => {
                    const submission = await this.submissionQuery.get(
                        user,
                        params.course,
                        params.homework,
                        params.student
                    );
                    if (submission instanceof HttpError) {
                        return status(submission.code, submission.message);
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
                "/homeworks/:homework/submissions",
                async ({ user, params, body, status }) => {
                    let result = await this.submitInteractor.invoke(
                        user,
                        params.course,
                        params.homework,
                        body.content
                    );
                    if (result instanceof HttpError) {
                        return status(result.code, result.message);
                    }
                },
                {
                    requireAuthentication: true,
                    params: t.Object({
                        course: t.String({ format: "uuid" }),
                        homework: t.String({ format: "uuid" })
                    }),
                    body: t.Object({
                        content: t.String({ maxLength: 65536 })
                    }),
                    detail: {
                        summary: "Submit homework",
                        description: "Creates new homework submission attempt.",
                        security: REQUIRE_TOKEN
                    }
                }
            )
            .post(
                "/homeworks/:homework/submissions/:student/review",
                async ({ user, params, body, status }) => {
                    let result = await this.reviewInteractor.invoke(
                        user,
                        params.course,
                        params.homework,
                        params.student,
                        {
                            accepted: body.accepted,
                            content: body.content,
                            files: []
                        }
                    );
                    if (result instanceof HttpError) {
                        return status(result.code, result.message);
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
                        accepted: t.Boolean()
                    }),
                    detail: {
                        summary: "Review homework",
                        description:
                            "Creates review of the last homework submission attempt.",
                        security: REQUIRE_TOKEN
                    }
                }
            );
    }
}
