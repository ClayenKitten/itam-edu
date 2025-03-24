import { t } from "elysia";

/** Public information about the user. */
export const user = t.Object({
    id: t.String({ format: "uuid" }),
    firstName: t.Nullable(t.String({ maxLength: 100 })),
    lastName: t.Nullable(t.String({ maxLength: 100 })),
    patronim: t.Nullable(t.String({ maxLength: 100 })),
    email: t.Nullable(t.String({ format: "email", maxLength: 500 })),
    avatar: t.Nullable(t.String({ format: "url", maxLength: 1000 })),
    bio: t.Nullable(t.String({ maxLength: 500 })),
    tgUsername: t.String()
});

export const globalPermissions = t.Object({
    isSupervisor: t.Boolean(),
    canCreateCourses: t.Boolean(),
    canPublishCourses: t.Boolean()
});

export const coursePermissions = t.Object({
    courseId: t.String({ format: "uuid" }),
    isOwner: t.Boolean(),
    canEditInfo: t.Boolean(),
    canEditContent: t.Boolean(),
    canManageSubmissions: t.Boolean()
});
