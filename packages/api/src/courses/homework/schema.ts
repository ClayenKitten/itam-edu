import { t } from "elysia";

export const homework = t.Object({
    id: t.String({ format: "uuid" }),
    courseId: t.String({ format: "uuid" }),
    createdAt: t.Date(),
    title: t.String(),
    content: t.Nullable(t.String()),
    deadline: t.Nullable(t.Date()),
    overrideAcceptingSubmissions: t.Nullable(t.Boolean())
});
export const createHomework = t.Pick(homework, ["title"]);
export const updateHomework = t.Pick(homework, [
    "title",
    "content",
    "deadline",
    "overrideAcceptingSubmissions"
]);
