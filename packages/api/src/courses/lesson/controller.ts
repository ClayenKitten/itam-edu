import { Elysia, status, t } from "elysia";
import * as schema from "./schema";
import { REQUIRE_TOKEN } from "../../api/plugins/docs";
import { HttpError } from "../../api/errors";
import type { AppContext } from "../../ctx";
import { authenticationPlugin } from "../../api/plugins/authenticate";

export function lessonController(ctx: AppContext) {
    return new Elysia({
        name: "lessons",
        prefix: "/courses/:course/lessons",
        tags: ["Lessons"]
    })
        .derive(() => ctx)
        .use(authenticationPlugin(ctx))
        .guard({
            params: t.Object(
                { course: t.String({ format: "uuid" }) },
                { additionalProperties: true }
            )
        })
        .derive(async ({ db, params, status }) => {
            const course = await db.course.getById(params.course);
            if (!course) return status(404);
            return { course };
        })
        .get(
            "",
            async ({ db, params }) => {
                const lessons = await db.lessonQuery.getAll(params.course);
                return lessons;
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
            async ({ user, course, services, body, status }) => {
                const lesson = await services.lesson.create(
                    user,
                    course,
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
            async ({ user, course, services, params, body }) => {
                const result = await services.lesson.updateAll(
                    user,
                    course,
                    body.lessons
                );
                if (result instanceof HttpError) {
                    return status(result.code, result.message);
                }
            },
            {
                requireAuthentication: true,
                body: t.Object({ lessons: schema.updateLessonsList }),
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
            async ({ db, params, status }) => {
                const lesson = await db.lessonQuery.get(
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
            async ({ params, services, body, user, db, status }) => {
                const [course, lesson] = await Promise.all([
                    db.course.getById(params.course),
                    db.lesson.getById(params.lesson)
                ]);
                if (!course || !lesson) return status(404);

                const newLesson = await services.lesson.update(
                    user,
                    course,
                    lesson,
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
