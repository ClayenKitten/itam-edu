import type { Selectable } from "kysely";
import type { Users as UserTable } from "itam-edu-db";
import * as schema from "./schema";
import { Value } from "@sinclair/typebox/value";

export class User {
    public constructor(
        private info: Selectable<UserTable>,
        public enrollments: { courseId: string }[],
        public permissions: Permissions
    ) {}

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
        return this.permissions.course(courseId) !== null;
    }

    /** Returns public user information. */
    public toPublicDTO(): typeof schema.publicUserInfo.static {
        return {
            id: this.info.id,
            firstName: this.info.firstName,
            lastName: this.info.lastName,
            patronim: this.info.patronim,
            bio: this.info.bio,
            tgUsername: this.info.tgUsername,
            avatar: this.info.avatar
        };
    }

    /** Returns private user information. */
    public toPrivateDTO(): typeof schema.privateUserInfo.static {
        return {
            ...this.toPublicDTO(),
            email: this.info.email
        };
    }

    public get id() {
        return this.info.id;
    }
    public get firstName() {
        return this.info.firstName;
    }
    public get lastName() {
        return this.info.lastName;
    }
    public get patronim() {
        return this.info.patronim;
    }
    public get email() {
        return this.info.email;
    }
    public get tgUsername() {
        return this.info.tgUsername;
    }
    public get tgChatId() {
        return this.info.tgChatId;
    }
    public get tgUserId() {
        return this.info.tgUserId;
    }
}

export class Permissions {
    public constructor(
        private globalPermissions: typeof schema.globalPermissions.static,
        private coursePermissions: {
            courseId: string;
            permissions: typeof schema.coursePermissions.static;
        }[]
    ) {}

    public get global() {
        return this.globalPermissions;
    }

    public course(id: string) {
        const coursePerms = this.coursePermissions.find(
            ({ courseId }) => id === courseId
        )?.permissions;
        if (!coursePerms) return null;
        return coursePerms;
    }

    public toDTO() {
        return {
            global: this.globalPermissions,
            course: this.coursePermissions
        };
    }
}
