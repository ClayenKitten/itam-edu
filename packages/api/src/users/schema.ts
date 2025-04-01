import { t } from "elysia";

export const enrollment = t.Object({ courseId: t.String({ format: "uuid" }) });

/** Public information about the user. */
export const publicUserInfo = t.Object({
    id: t.String({ format: "uuid" }),
    firstName: t.Nullable(t.String({ maxLength: 100 })),
    lastName: t.Nullable(t.String({ maxLength: 100 })),
    patronim: t.Nullable(t.String({ maxLength: 100 })),
    avatar: t.Nullable(t.String({ format: "url", maxLength: 1000 })),
    bio: t.Nullable(t.String({ maxLength: 500 })),
    tgUsername: t.String()
});

/** Private information about the user. */
export const privateUserInfo = t.Object({
    ...publicUserInfo.properties,
    email: t.Nullable(t.String({ format: "email", maxLength: 500 }))
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
