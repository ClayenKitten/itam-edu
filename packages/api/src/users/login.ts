import { randomInt } from "crypto";
import type { User } from "itam-edu-common";
import { Repository } from "../db/repository";

export class LoginCode {
    public constructor(
        public userId: string,
        public code: string,
        public expires: Date
    ) {}

    /** Creates a new login code. */
    public static create(user: User): LoginCode {
        const codeLength = 6;
        const codeRadix = 16;
        const code = randomInt(0, codeRadix ** codeLength)
            .toString(codeRadix)
            .padStart(codeLength, "0")
            .toUpperCase();

        const expires = new Date(
            new Date().getTime() + this.TTL_MINUTES * 60000
        );

        return new LoginCode(user.id, code, expires);
    }

    /** Time-to-live for the login code in minutes. */
    public static TTL_MINUTES = 5;
}

export class LoginCodeRepository extends Repository {
    public async get(code: string): Promise<LoginCode | null> {
        const result = await this.db
            .selectFrom("userLoginAttempts")
            .selectAll()
            .where("code", "=", code)
            .where("expires", ">", new Date())
            .executeTakeFirst();
        if (!result) return null;
        return new LoginCode(result.userId, result.code, result.expires);
    }

    public async set(loginCode: LoginCode): Promise<void> {
        let { userId, code, expires } = loginCode;
        await this.db.transaction().execute(async trx => {
            await trx
                .deleteFrom("userLoginAttempts")
                .where(({ eb, or }) =>
                    or([eb("userId", "=", userId), eb("code", "=", code)])
                )
                .execute();
            await trx
                .insertInto("userLoginAttempts")
                .values({ userId, code, expires })
                .executeTakeFirstOrThrow();
        });
    }

    public async delete(loginCode: LoginCode) {
        await this.db
            .deleteFrom("userLoginAttempts")
            .where("code", "=", loginCode.code)
            .executeTakeFirst();
    }
}
