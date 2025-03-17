import { Elysia, t } from "elysia";
import initContext from "../../api/plugins";
import * as schema from "./schema";
import { DEFAULT_SECURITY } from "../../api/plugins/docs";

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
                const lessons = await db.lesson.getAll(params.course);
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
                return lesson;
            },
            {
                body: t.Object({ lesson: schema.createLesson }),
                hasCoursePermission: "canEditContent",
                detail: {
                    summary: "Create new lesson",
                    description: "Creates new lesson.",
                    security: DEFAULT_SECURITY
                }
            }
        )
        .put(
            "",
            async ({ db, params, body }) => {
                await db.lesson.updatePositions(params.course, body.lessons);
                return "Ok";
            },
            {
                body: t.Object({ lessons: schema.updateLessonPositions }),
                hasCoursePermission: "canEditContent",
                detail: {
                    summary: "Reorder lessons",
                    description:
                        "Updates lessons ordering.\n\n" +
                        "All currently added lessons must be present, or error will be returned.",
                    security: DEFAULT_SECURITY
                }
            }
        )
        .get(
            "/:lesson",
            async ({ db, params, error }) => {
                const lesson = await db.lesson.get(
                    params.course,
                    params.lesson
                );
                if (!lesson) return error(404);
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
        );
}
