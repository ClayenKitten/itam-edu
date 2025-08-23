import {
    type CoursePermissions,
    type CourseRole,
    type User
} from "itam-edu-common";
import * as schema from "./schema";
import { coursePermissions } from "./policy";

export class Course {
    public constructor(
        public info: typeof schema.course.static,
        public members: {
            id: string;
            role: CourseRole;
        }[]
    ) {}

    public get id(): string {
        return this.info.id;
    }

    public get canEnrollStudents(): boolean {
        return (
            this.info.isEnrollmentOpen &&
            this.info.isPublished &&
            !this.info.isArchived
        );
    }

    public get path(): string {
        if (this.info.semester) {
            return `/c/${this.info.year}/${this.info.semester}/${this.info.slug}`;
        }
        return `/c/${this.info.year}/${this.info.slug}`;
    }

    public get studentCount(): number {
        return this.members.filter(m => m.role === "student").length;
    }

    public get staffCount(): number {
        return this.members.filter(m => m.role !== "student").length;
    }

    /** Returns {@link CourseRole} for provided user, or null if user is not member of the course. */
    public getRoleFor(user: User): CourseRole | null {
        return this.members.find(m => m.id === user.id)?.role ?? null;
    }

    /** Returns {@link CoursePermissions} for provided user, or null if course is not accessible to the user. */
    public getPermissionsFor(user: User | null): CoursePermissions | null {
        return coursePermissions(user, this);
    }

    public toDTO(): typeof schema.course.static {
        return this.info;
    }
}
