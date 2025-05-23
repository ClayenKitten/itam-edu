import { injectable } from "inversify";
import { randomInt } from "crypto";
import type { User } from "itam-edu-common";
import { Redis } from "../infra/redis";
import { UserRepository } from "./repository";

@injectable()
export class LoginCodeRepository {
    public constructor(
        protected userRepo: UserRepository,
        protected redis: Redis
    ) {}

    protected getKey(code: string) {
        return `login-codes:${code}`;
    }
    public readonly EXPIRATION_SECONDS = 300;

    /** Creates new login code for the user. */
    public async create(user: User): Promise<string> {
        const code = this.generateCode();
        const key = this.getKey(code);
        await this.redis.exec(r =>
            r.setex(key, this.EXPIRATION_SECONDS, user.id)
        );
        return code;
    }

    /** Removes login code and returns associated user. */
    public async pop(code: string): Promise<User | null> {
        const key = this.getKey(code);
        const userId = await this.redis.exec(r => r.getdel(key));
        if (!userId) return null;
        const user = await this.userRepo.getById(userId);
        if (!user) return null;
        return user;
    }

    protected generateCode(): string {
        const codeLength = 6;
        const codeRadix = 16;
        const code = randomInt(0, codeRadix ** codeLength)
            .toString(codeRadix)
            .padStart(codeLength, "0")
            .toUpperCase();
        return code;
    }
}
