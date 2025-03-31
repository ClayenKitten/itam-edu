import { t } from "elysia";

export const enrollment = t.Object({
    courseId: t.String({ format: "uuid" }),
    userId: t.String({ format: "uuid" })
});
