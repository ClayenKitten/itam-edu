import { injectable } from "inversify";
import { Elysia, t } from "elysia";
import { REQUIRE_TOKEN } from "../../api/plugins/docs";
import { HttpError } from "../../api/errors";
import { AuthenticationPlugin } from "../../api/plugins/authenticate";
import { UserRepository } from "../../users/repository";
import { CourseRepository } from "../repository";
import { SubmissionQuery } from "./query";
import { HomeworkRepository } from "../homework/repository";
import { ReviewHomework } from "./review.interactor";
import { SubmitHomework } from "./submit.interactor";

@injectable()
export class SubmissionController {
    public constructor(
        protected authPlugin: AuthenticationPlugin,
        protected userRepo: UserRepository,
        protected courseRepo: CourseRepository,
        protected homeworkRepo: HomeworkRepository,
        protected submissionQuery: SubmissionQuery,
        protected submitInteractor: SubmitHomework,
        protected reviewInteractor: ReviewHomework
    ) {}

    public toElysia() {
        return new Elysia({
            prefix: "/courses/:course",
            tags: ["Submissions"]
        })
            .use(this.authPlugin.toElysia())
            .derive(async ({ params, status }) => {
                const course = await this.courseRepo.getById(params.course);
                if (!course) return status(404, "Course not found.");
                return { course };
            })
            .get(
                "/submissions",
                async ({ user, course, query, status }) => {
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
                "/homeworks/:homework/submissions/:student",
                async ({ user, course, params, status }) => {
                    const [homework, student] = await Promise.all([
                        this.homeworkRepo.getById(params.homework),
                        this.userRepo.getById(params.student)
                    ]);
                    if (!homework || !student) return status(404);

                    const submission = await this.submissionQuery.get(
                        user,
                        course,
                        homework.id,
                        student.id
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
                async ({ user, course, params, body, status }) => {
                    const homework = await this.homeworkRepo.getById(
                        params.homework
                    );
                    if (!homework) return status(404);

                    let result = await this.submitInteractor.invoke(
                        user,
                        course,
                        homework,
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
                    const [course, homework, student] = await Promise.all([
                        this.courseRepo.getById(params.course),
                        this.homeworkRepo.getById(params.homework),
                        this.userRepo.getById(params.student)
                    ]);
                    if (!course || !homework || !student) return status(404);

                    let result = await this.reviewInteractor.invoke(
                        user,
                        course,
                        homework,
                        student,
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
