import { t } from "elysia";

export const student = t.Object({
    id: t.String({ format: "uuid" }),
    courseId: t.String({ format: "uuid" }),
    firstName: t.String(),
    lastName: t.Nullable(t.String()),
    bio: t.Nullable(t.String()),
    avatar: t.Nullable(t.String()),
    tgUsername: t.String(),
    role: t.Literal("student"),
    acceptedSubmissions: t.Number({ multipleOf: 1 }),
    totalSubmissions: t.Number({ multipleOf: 1 }),
    rejectedSubmissions: t.Number({ multipleOf: 1 })
});
export type StudentDto = typeof student.static;

export const studentRole = student.properties.role;
export type StudentRole = typeof studentRole.static;
