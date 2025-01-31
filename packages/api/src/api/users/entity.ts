import type { Selectable } from "kysely";
import type { Users as UserTable } from "itam-edu-db";
import * as schema from "./schema";
import { Value } from "@sinclair/typebox/value";

export class User {
    public constructor(
        private user: Selectable<UserTable>,
        public permissions: Permissions
    ) {}

    /** Returns public user DTO. */
    public toPublicDTO(): typeof schema.user.static {
        let val = Value.Clone(this.user);
        Value.Clean(schema.user, val);
        return val;
    }

    public get id() {
        return this.user.id;
    }
    public get firstName() {
        return this.user.firstName;
    }
    public get lastName() {
        return this.user.lastName;
    }
    public get patronim() {
        return this.user.patronim;
    }
    public get email() {
        return this.user.email;
    }
    public get tgUsername() {
        return this.user.tgUsername;
    }
}

export class Permissions {
    public constructor(
        private globalPermissions: typeof schema.globalPermissions.static,
        private coursePermissions: (typeof schema.coursePermissions.static)[]
    ) {}

    public get global() {
        return this.globalPermissions;
    }

    public course(id: string) {
        const coursePerms = this.coursePermissions.find(
            ({ courseId }) => id === courseId
        );
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
