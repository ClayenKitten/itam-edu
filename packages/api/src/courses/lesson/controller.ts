import { Elysia, t } from "elysia";
import initContext from "../../api/plugins";
import * as schema from "./schema";
import { REQUIRE_TOKEN } from "../../api/plugins/docs";
import { HttpError } from "../../api/errors";

export function lessonController<PREFIX extends string>(prefix: PREFIX) {
    return new Elysia({ name: "lessons", prefix, tags: ["Lessons"] })
        .use(initContext())
        .guard({
            params: t.Object(
                { course: t.String({ format: "uuid" }) },
                { additionalProperties: true }
            )
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
            async ({ db, params, body, error, set }) => {
                const lesson = await db.lesson.create(
                    params.course,
                    body.lesson
                );
                if (lesson === null) return error(400);
                set.status = 201;
                return { id: lesson.id };
            },
            {
                body: t.Object({ lesson: schema.createLesson }),
                hasCoursePermission: "canEditContent",
                detail: {
                    summary: "Create new lesson",
                    description: "Creates new lesson.",
                    security: REQUIRE_TOKEN
                }
            }
        )
        .put(
            "",
            async ({ db, params, body }) => {
                await db.lesson.updateAll(params.course, body.lessons);
                return "Ok";
            },
            {
                body: t.Object({ lessons: schema.updateLessonsList }),
                hasCoursePermission: "canEditContent",
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
            async ({ db, params, error }) => {
                const lesson = await db.lessonQuery.get(
                    params.course,
                    params.lesson
                );
                if (lesson instanceof HttpError) {
                    return error(lesson.code, lesson.message);
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
            async ({ params, lesson: service, body, user, db, error }) => {
                const [course, lesson] = await Promise.all([
                    db.course.getById(params.course),
                    db.lesson.getById(params.lesson)
                ]);
                if (!course || !lesson) return error(404);

                const newLesson = await service.update(
                    user,
                    course,
                    lesson,
                    body
                );
                if (newLesson instanceof HttpError) {
                    return error(newLesson.code, newLesson.message);
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
