import { injectable } from "inversify";
import { Redis } from "../../../infra/redis";
import type { StaffRole } from "../schema";
import { Invite } from "./entity";

@injectable()
export class InviteRepository {
    public constructor(private redis: Redis) {}

    public async save(invite: Invite): Promise<void> {
        const payload: Payload = {
            role: invite.role,
            courseId: invite.courseId,
            expiresAt: invite.expiresAt.getTime()
        };
        await this.redis.hSetEx(
            "invites",
            { [invite.code]: JSON.stringify(payload) },
            { expiration: { type: "PXAT", value: payload.expiresAt } }
        );
    }

    public async load(code: string): Promise<Invite | null> {
        const payloadStr = await this.redis.hGet("invites", code);
        if (!payloadStr) return null;
        const payload = JSON.parse(payloadStr) as Payload;
        return new Invite(
            code,
            payload.courseId,
            payload.role,
            new Date(payload.expiresAt)
        );
    }

    public async loadAll(courseId: string): Promise<Invite[]> {
        const result = await this.redis.hGetAll("invites");
        const invites = Object.entries(result)
            .map(([code, payload]) => {
                const { role, expiresAt, courseId } = JSON.parse(
                    payload
                ) as Payload;
                return new Invite(code, courseId, role, new Date(expiresAt));
            })
            .filter(invite => invite.courseId === courseId);
        return invites;
    }

    public async remove(code: string): Promise<void> {
        await this.redis.hDel("invites", code);
    }
}

type Payload = {
    role: StaffRole;
    courseId: string;
    expiresAt: number;
};
