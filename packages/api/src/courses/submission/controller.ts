import { injectable } from "inversify";
import { Elysia, t } from "elysia";
import { REQUIRE_TOKEN } from "../../api/plugins/docs";
import { HttpError } from "../../api/errors";
import { authenticationPlugin } from "../../api/plugins/authenticate";
import { UserRepository } from "../../users/repository";
import { CourseRepository } from "../repository";
import { SubmissionRepository } from "./repository";
import { SubmissionQuery } from "./query";
import { HomeworkRepository } from "../homework/repository";
import { SubmissionService } from "./service";

@injectable()
export class SubmissionController {
    public constructor(
        protected userRepo: UserRepository,
        protected courseRepo: CourseRepository,
        protected homeworkRepo: HomeworkRepository,
        protected submissionRepo: SubmissionRepository,
        protected submissionQuery: SubmissionQuery,
        protected submissionService: SubmissionService
    ) {}

    public toElysia() {
        return new Elysia({
            prefix: "/courses/:course/submissions",
            tags: ["Submissions"]
        })
            .use(authenticationPlugin(this.userRepo))
            .get(
                "",
                async ({ user, params, query, status }) => {
                    const course = await this.courseRepo.getById(params.course);
                    if (!course) return status(404);

                    const submissions = await this.submissionQuery.getAll(
                        user,
                        course,
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
                "/:homework/:student",
                async ({ user, params, status }) => {
                    const [course, homework, student] = await Promise.all([
                        this.courseRepo.getById(params.course),
                        this.homeworkRepo.getById(params.homework),
                        this.userRepo.getById(params.student)
                    ]);
                    if (!course || !homework || !student) return status(404);

                    const submission = await this.submissionQuery.get(
                        user,
                        course,
                        homework,
                        student
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
                "/:homework/:student",
                async ({ user, params, body, status }) => {
                    const [course, homework, student] = await Promise.all([
                        this.courseRepo.getById(params.course),
                        this.homeworkRepo.getById(params.homework),
                        this.userRepo.getById(params.student)
                    ]);
                    if (!course || !homework || !student) return status(404);
                    const result = await this.submissionService.sendMessage(
                        user,
                        course,
                        homework,
                        student,
                        body.content,
                        body.accepted
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
}
