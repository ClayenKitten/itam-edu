import { injectable } from "inversify";
import { Redis } from "../../../infra/redis";

@injectable()
export class LoginCodeDao {
    public constructor(private redis: Redis) {}

    /** Persists login code. */
    public async add(
        userId: string,
        code: string,
        expirationSeconds: number
    ): Promise<void> {
        const key = this.getKey(code);
        await this.redis.setEx(key, expirationSeconds, userId);
    }

    /**
     * Removes login code.
     *
     * @returns id of the user who issued the code, if found.
     * */
    public async remove(code: string): Promise<string | null> {
        const key = this.getKey(code);
        const userId = await this.redis.getDel(key);
        if (!userId) return null;
        return userId;
    }

    /** Returns Redis key for the specified code. */
    private getKey(code: string) {
        return `login-codes:${code}`;
    }
}
