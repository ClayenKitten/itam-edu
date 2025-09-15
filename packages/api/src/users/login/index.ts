import { UserRepository } from "../repository";
import { SessionRepository } from "../sessions/repository";
import { LoginCodeDao } from "./code.dao";
import { Session } from "../sessions/entity";
import { randomInt } from "crypto";
import type { User } from "itam-edu-common";
import { injectable } from "inversify";

/** Handles process of user login on the web platform. */
@injectable()
export class UserLogin {
    public constructor(
        private userRepo: UserRepository,
        private sessionRepo: SessionRepository,
        private codeDao: LoginCodeDao
    ) {}

    /** Length of the generated login code. */
    public readonly CODE_LENGTH = 6;

    /** Time-to-live of the login code. */
    public readonly CODE_EXPIRATION_SECONDS = 300;

    /**
     * Generates and persists one-time code.
     *
     * This method must be initiated from a trusted source like Telegram bot.
     * */
    public async requestCode(user: User): Promise<string> {
        const code = this.generateCode();
        await this.codeDao.add(user.id, code, this.CODE_EXPIRATION_SECONDS);
        return code;
    }

    /**
     * Verifies provided one-time code to to complete login on the web platform.
     *
     * @returns Created session or `null` if verification failed.
     * */
    public async redeemCode(code: string): Promise<Session | null> {
        const userId = await this.codeDao.remove(code);
        if (!userId) return null;

        const user = await this.userRepo.getById(userId);
        if (!user) return null;

        const session = Session.create(user);
        await this.sessionRepo.add(session);
        return session;
    }

    /** Generates random code in hex format. */
    private generateCode(): string {
        const codeRadix = 16;
        const code = randomInt(0, codeRadix ** this.CODE_LENGTH)
            .toString(codeRadix)
            .padStart(this.CODE_LENGTH, "0")
            .toUpperCase();
        return code;
    }
}
