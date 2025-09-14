import { t } from "elysia";

export const homework = t.Object({
    id: t.String({ format: "uuid" }),
    courseId: t.String({ format: "uuid" }),
    createdAt: t.Date(),
    title: t.String({ minLength: 3 }),
    content: t.Nullable(t.String()),
    deadline: t.Nullable(t.Date()),
    deadlineOverride: t.Nullable(t.Boolean())
});
export const createHomework = t.Pick(homework, [
    "title",
    "content",
    "deadline",
    "deadlineOverride"
]);
export const updateHomework = t.Pick(homework, [
    "title",
    "content",
    "deadline",
    "deadlineOverride"
]);

export const reorderHomeworksList = t.Array(t.String({ format: "uuid" }));
