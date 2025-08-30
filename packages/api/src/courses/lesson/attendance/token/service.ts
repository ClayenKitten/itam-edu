import { injectable, inject } from "inversify";
import jwt from "jsonwebtoken";
import type { AppConfig } from "itam-edu-common/config";

/** Service to generate and validate short-living JWT for semi-automated attendance recording. */
@injectable()
export class AttendanceTokenService {
    public constructor(
        @inject("AppConfig")
        private config: AppConfig
    ) {}

    public readonly issuer = "itam-edu/attendance";
    public readonly audience = "itam-edu/attendance";
    public readonly expiresIn = "15s";

    /** Generates an attendance token. */
    public async create(payload: AttendanceTokenPayload): Promise<string> {
        return jwt.sign(payload, this.config.jwt.secret, {
            expiresIn: this.expiresIn,
            issuer: this.issuer,
            audience: this.audience
        });
    }

    /**
     * Tries to verify an attendance token.
     *
     * @returns token payload or null if validation failed.
     * */
    public async verify(token: string): Promise<AttendanceTokenPayload | null> {
        try {
            const decoded = jwt.verify(token, this.config.jwt.secret, {
                issuer: this.issuer,
                audience: this.audience
            }) as AttendanceTokenPayload;
            return decoded;
        } catch (err) {
            return null;
        }
    }
}

export interface AttendanceTokenPayload {
    courseId: string;
    lessonId: string;
}
