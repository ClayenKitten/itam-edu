import type { DB } from "itam-edu-db";

/**
 * List of available permissions, grouped by database tables and scope.
 *
 * Each permission name should match corresponding database column name.
 *
 * When adding new permission kind, don't forget to update user repository.
 * */
export const PermissionKinds = {
    /** Unscoped permissions. */
    user: [
        "isStaff",
        "canCreateCourses",
        "canPublishCourses"
    ] satisfies (keyof DB["users"])[],
    /** Permissions scoped to specific course. */
    course: [
        "isOwner",
        "canEditInfo",
        "canEditContent",
        "canManageSubmissions",
        "canManageBlog",
        "canManageFeedback"
    ] satisfies (keyof DB["courseStaff"])[]
} as const;

export type PermissionFlags<KIND extends keyof typeof PermissionKinds> = {
    [key in (typeof PermissionKinds)[KIND][number]]: boolean;
};
