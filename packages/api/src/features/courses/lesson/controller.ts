import { injectable } from "inversify";
import { Elysia, status, t } from "elysia";
import * as schema from "./schema";
import { REQUIRE_TOKEN } from "../../../ports/http/openapi";
import { HttpError } from "../../../api/errors";
import { AuthenticationPlugin } from "../../../ports/http/authn";
import { LessonQuery } from "./query";
import { CreateLesson } from "./create.interactor";
import { UpdateLesson } from "./update.interactor";
import { ReorderLessons } from "./reorder.interactor";

@injectable()
export class LessonController {
    public constructor(
        private authPlugin: AuthenticationPlugin,
        private lessonQuery: LessonQuery,
        private createInteractor: CreateLesson,
        private updateInteractor: UpdateLesson,
        private reorderInteractor: ReorderLessons
    ) {}

    public toElysia() {
        return new Elysia({
            name: "lessons",
            prefix: "/courses/:course/lessons",
            tags: ["Lessons"]
        })
            .use(this.authPlugin.toElysia())
            .guard({
                params: t.Object(
                    { course: t.String({ format: "uuid" }) },
                    { additionalProperties: true }
                )
            })
            .get(
                "",
                async ({ user, params, status }) => {
                    const result = await this.lessonQuery.getAll(
                        user,
                        params.course
                    );
                    if (result instanceof HttpError) {
                        return status(result.code, result.message);
                    }
                    return result;
                },
                {
                    detail: {
                        summary: "List lessons",
                        description: "Returns all lessons of the course."
                    }
                }
            )
            .post(
                "",
                async ({ params, user, body, status }) => {
                    const lesson = await this.createInteractor.invoke(
                        user,
                        params.course,
                        body.lesson
                    );
                    if (lesson instanceof HttpError) {
                        return status(lesson.code, lesson.message);
                    }
                    return { id: lesson.id };
                },
                {
                    requireAuthentication: true,
                    body: t.Object({ lesson: schema.createLesson }),
                    detail: {
                        summary: "Create new lesson",
                        description: "Creates new lesson.",
                        security: REQUIRE_TOKEN
                    }
                }
            )
            .put(
                "",
                async ({ user, body, params }) => {
                    const result = await this.reorderInteractor.invoke(
                        user,
                        params.course,
                        body.lessons
                    );
                    if (result instanceof HttpError) {
                        return status(result.code, result.message);
                    }
                },
                {
                    requireAuthentication: true,
                    body: t.Object({ lessons: schema.reorderLessonsList }),
                    detail: {
                        summary: "Update lessons",
                        description:
                            "Updates lessons list ordering. If lesson is not present, it is deleted.",
                        security: REQUIRE_TOKEN
                    }
                }
            )
            .get(
                "/:lesson",
                async ({ user, params, status }) => {
                    const lesson = await this.lessonQuery.get(
                        user,
                        params.course,
                        params.lesson
                    );
                    if (lesson instanceof HttpError) {
                        return status(lesson.code, lesson.message);
                    }
                    return lesson;
                },
                {
                    params: t.Object(
                        { lesson: t.String() },
                        { additionalProperties: true }
                    ),
                    detail: {
                        summary: "Get lesson",
                        description: "Returns lesson with content."
                    }
                }
            )
            .patch(
                "/:lesson",
                async ({ params, body, user, status }) => {
                    const newLesson = await this.updateInteractor.invoke(
                        user,
                        params.course,
                        params.lesson,
                        body
                    );
                    if (newLesson instanceof HttpError) {
                        return status(newLesson.code, newLesson.message);
                    }
                },
                {
                    requireAuthentication: true,
                    params: t.Object(
                        { lesson: t.String() },
                        { additionalProperties: true }
                    ),
                    body: schema.updateLesson,
                    detail: {
                        summary: "Update lesson",
                        description: "Updates lesson."
                    }
                }
            );
    }
}
