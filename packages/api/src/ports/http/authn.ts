import { Elysia } from "elysia";
import logger from "../../logger";
import { UserRepository } from "../../features/users/repository";
import { SessionRepository } from "../../features/users/sessions/repository";
import { injectable } from "inversify";

/** Retrieves user information and permissions, registers macroses for authorization. */
@injectable()
export class AuthenticationPlugin {
    public constructor(
        protected sessionRepo: SessionRepository,
        protected userRepo: UserRepository
    ) {}

    public toElysia() {
        return new Elysia({ name: "authenticate" })
            .derive(async ({ headers, cookie }) => {
                let token =
                    headers["authorization"]?.replace(/^Bearer /, "") ||
                    cookie["itam-edu-token"]?.value;
                if (!token) return { session: null, user: null };

                const session = await this.sessionRepo.getByToken(
                    token as string
                );
                if (!session) return { session: null, user: null };

                let user = await this.userRepo.getById(session.userId);
                return { session, user };
            })
            .onTransform(({ user }) => logger.extend({ user: user?.id }))
            .macro({
                requireAuthentication: {
                    resolve: ({ session, user, status }) => {
                        if (!session || !user) {
                            return status(401, "Authentication required");
                        }
                        return { session, user };
                    }
                }
            })
            .as("scoped");
    }
}
