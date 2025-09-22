import type {
    CourseRole,
    GlobalPermissions,
    GlobalRole
} from "./access-control";

/** User of the system. */
export class User {
    public constructor(
        public id: string,
        public info: {
            avatar: string | null;
            bio: string | null;
            email: string | null;
            firstName: string;
            lastName: string | null;
            patronim: string | null;
            role: GlobalRole;
        },
        public telegram: {
            id: string;
            username: string;
        },
        public courses: {
            id: string;
            role: CourseRole;
        }[]
    ) {}

    /** Returns name that should be displayed. */
    public get displayName(): string {
        let result = this.info.firstName ?? "" + this.info.lastName ?? "";
        if (result === "") return this.telegram.username;
        return result;
    }

    /** Returns `true` if user is course student or staff member. */
    public isCourseMember(courseId: string) {
        return this.courses.some(c => c.id === courseId);
    }

    /** Returns `true` if user is enrolled to the course. */
    public isCourseStudent(courseId: string) {
        return this.courses.some(
            c => c.id === courseId && c.role === "student"
        );
    }

    /** Returns `true` if user is part of the course's staff. */
    public isCourseStaff(courseId: string): boolean {
        return this.courses.some(
            c =>
                c.id === courseId &&
                (c.role === "teacher" || c.role === "admin")
        );
    }

    public get permissions(): GlobalPermissions {
        return {
            users: {
                view:
                    this.info.role === "admin" ||
                    this.info.role === "supervisor",
                ban:
                    this.info.role === "admin" ||
                    this.info.role === "supervisor"
            },
            courses: {
                create:
                    this.info.role === "admin" ||
                    this.info.role === "supervisor",
                archive:
                    this.info.role === "admin" ||
                    this.info.role === "supervisor",
                publish:
                    this.info.role === "admin" ||
                    this.info.role === "supervisor"
            }
        };
    }
}
