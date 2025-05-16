import { injectable } from "inversify";
import { Elysia, t } from "elysia";
import * as schema from "./schema";
import { REQUIRE_TOKEN } from "../../api/plugins/docs";
import { HttpError } from "../../api/errors";
import { authenticationPlugin } from "../../api/plugins/authenticate";
import { UserRepository } from "../../users/repository";
import { CourseRepository } from "../repository";
import { HomeworkRepository } from "./repository";
import { HomeworkQuery } from "./query";

@injectable()
export class HomeworkController {
    public constructor(
        protected userRepo: UserRepository,
        protected courseRepo: CourseRepository,
        protected homeworkRepo: HomeworkRepository,
        protected homeworkQuery: HomeworkQuery
    ) {}

    public toElysia() {
        return new Elysia({
            name: "homeworks",
            prefix: "/courses/:course/homeworks",
            tags: ["Homeworks"]
        })
            .use(authenticationPlugin(this.userRepo))
            .get(
                "",
                async ({ params }) => {
                    const homeworks = await this.homeworkQuery.getAll(
                        params.course
                    );
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
                async ({ params, body }) => {
                    const homework = await this.homeworkRepo.create(
                        params.course,
                        body
                    );
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
                async ({ params, body }) => {
                    await this.homeworkRepo.updateAll(
                        params.course,
                        body.homeworks
                    );
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
                async ({ params, status }) => {
                    const homework = await this.homeworkQuery.get(
                        params.course,
                        params.homework
                    );
                    if (homework instanceof HttpError) {
                        return status(homework.code, homework.message);
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
                async ({ params, body, status }) => {
                    const homework = await this.homeworkRepo.update(
                        params.homework,
                        body
                    );
                    if (!homework) return status(404);
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
}
