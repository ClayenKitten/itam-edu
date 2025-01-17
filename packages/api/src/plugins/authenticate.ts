import { Elysia } from "elysia";
import repositories from "./db";
import logger from "./logger";

export default function authenticate() {
    return new Elysia({ name: "authenticate" })
        .use(logger())
        .use(repositories())
        .derive(async ({ headers, db, logger }) => {
            let token = headers["authorization"]?.replace(/^Bearer /, "");
            let user =
                token !== undefined ? await db.user.getByToken(token) : null;
            return {
                user,
                logger: logger.child({ user: user?.id ?? null })
            };
        })
        .macro({
            requireAuthentication: {
                resolve: ({ user, error }) => {
                    if (!user) return error(401);
                    return { user };
                }
            }
        })
        .as("plugin");
}
