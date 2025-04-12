/** User of the system. */
export class User {
    public constructor(
        public id: string,
        public info: {
            avatar: string | null;
            bio: string | null;
            email: string | null;
            firstName: string | null;
            lastName: string | null;
            patronim: string | null;
        },
        public telegram: {
            id: string;
            username: string;
        },
        public enrollments: { courseId: string }[] = [],
        public permissions: Permissions = DEFAULT_PERMISSIONS
    ) {}

    /** Returns name that should be displayed. */
    public get displayName(): string {
        let result = this.info.firstName ?? "" + this.info.lastName ?? "";
        if (result === "") return this.telegram.username;
        return result;
    }

    /** Returns `true` if user is enrolled to the course. */
    public isCourseStudent(courseId: string) {
        return this.enrollments.some(
            enrollment => enrollment.courseId === courseId
        );
    }

    /** Returns `true` if user is part of the course's staff. */
    public isCourseStaff(courseId: string): boolean {
        if (this.permissions.global.isSupervisor) {
            return true;
        }
        return this.getCoursePermissions(courseId) !== null;
    }

    /** Returns `true` if user has requested permission. */
    public hasPermission(permission: keyof GlobalPermissions): boolean {
        return this.permissions.global[permission] === true;
    }

    /** Returns `true` if user has requested course permission. */
    public hasCoursePermission(
        courseId: string,
        permission: keyof CoursePermissions
    ): boolean {
        let perms = this.getCoursePermissions(courseId);
        if (!perms) return false;
        return perms[permission] === true;
    }

    private getCoursePermissions(courseId: string): CoursePermissions | null {
        const coursePerms = this.permissions.course[courseId];
        if (!coursePerms) return null;
        return coursePerms;
    }
}

export type Permissions = {
    global: GlobalPermissions;
    course: Record<string, CoursePermissions>;
};

export const DEFAULT_PERMISSIONS = {
    global: {
        isSupervisor: false,
        canCreateCourses: false,
        canPublishCourses: false
    },
    course: {}
} satisfies Permissions;

export type GlobalPermissions = {
    isSupervisor: boolean;
    canCreateCourses: boolean;
    canPublishCourses: boolean;
};

export type CoursePermissions = {
    isOwner: boolean;
    canEditInfo: boolean;
    canEditContent: boolean;
    /** If set to true, user can modify  */
    canManageSubmissions: boolean;
};
