import { randomBytes } from "crypto";
import type { StaffRole } from "../schema";

export class Invite {
    public constructor(
        public code: string,
        public courseId: string,
        public role: StaffRole,
        public expiresAt: Date
    ) {}

    public static create(courseId: string, role: StaffRole): Invite {
        const code = randomBytes(32).toString("base64url");
        const ttlMs = 24 * 60 * 60 * 1000;
        return new Invite(code, courseId, role, new Date(Date.now() + ttlMs));
    }
}
