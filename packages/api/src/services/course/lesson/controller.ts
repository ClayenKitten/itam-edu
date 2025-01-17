import { Elysia, t } from "elysia";
import initContext from "../../../plugins";
import * as schema from "./schema";

export function lessonController(prefix: string) {
    return new Elysia({ name: "lessons", prefix, tags: ["Lessons"] })
        .use(initContext())
        .guard({
            params: t.Object({ course: t.String({ format: "uuid" }) })
        })
        .get("", async ({ db, params }) => {
            const lessons = await db.lesson.getAll(params.course);
            return lessons;
        })
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
                hasCoursePermission: "canEditContent"
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
                hasCoursePermission: "canEditContent"
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
            { params: t.Object({ lesson: t.String() }) }
        );
}
