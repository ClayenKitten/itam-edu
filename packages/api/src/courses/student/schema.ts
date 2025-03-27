import { t } from "elysia";

export const student = t.Object({
    courseId: t.String({ format: "uuid" }),
    userId: t.String({ format: "uuid" })
});
