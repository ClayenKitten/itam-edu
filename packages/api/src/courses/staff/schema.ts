import { t } from "elysia";

export const staffMember = t.Object({
    id: t.String({ format: "uuid" }),
    courseId: t.String({ format: "uuid" }),
    firstName: t.String(),
    lastName: t.Nullable(t.String()),
    bio: t.Nullable(t.String()),
    avatar: t.Nullable(t.String()),
    tgUsername: t.String(),
    role: t.Union([t.Literal("admin"), t.Literal("teacher")])
});
export type StaffMemberDto = typeof staffMember.static;

export const staffRole = staffMember.properties.role;
export type StaffRole = typeof staffRole.static;
