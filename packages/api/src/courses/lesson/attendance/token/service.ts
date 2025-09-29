import { injectable } from "inversify";
import { Redis } from "../../../../infra/redis";
import { randomBytes } from "crypto";

/** Service to generate and validate short-living JWT for semi-automated attendance recording. */
@injectable()
export class AttendanceTokenService {
    public constructor(private redis: Redis) {}

    /** Generates an attendance token. */
    public async create(payload: AttendanceTokenPayload): Promise<string> {
        const token = randomBytes(24).toString("base64url");
        const key = `attendance-tokens:${token}`;

        await this.redis.set(key, JSON.stringify(payload), {
            expiration: { type: "EX", value: 15 }
        });

        return token;
    }

    /**
     * Tries to verify an attendance token.
     *
     * @returns token payload or null if validation failed.
     * */
    public async verify(token: string): Promise<AttendanceTokenPayload | null> {
        const key = `attendance-tokens:${token}`;
        const value = await this.redis.get(key);
        if (value === null) return null;
        const payload = JSON.parse(value) as AttendanceTokenPayload;
        return payload;
    }
}

export interface AttendanceTokenPayload {
    courseId: string;
    lessonId: string;
}
