import { t } from "elysia";

export const lesson = t.Object({
    courseId: t.String({ format: "uuid" }),
    title: t.String({ minLength: 3, maxLength: 80 }),
    slug: t.String({ pattern: "^[a-z][a-z0-9-]*$" }),
    content: t.Nullable(t.String()),
    banner: t.Nullable(t.String({ format: "uri", maxLength: 1000 })),
    createdAt: t.Date(),
    scheduledAt: t.Nullable(t.Date())
});
export const lessonWithoutContent = t.Omit(lesson, ["content"]);
export const updateLesson = t.Pick(lesson, ["title", "content"]);
export const updateLessonPositions = t.Array(t.String(), { minItems: 1 });
export const createLesson = t.Pick(lesson, ["title", "slug"]);
