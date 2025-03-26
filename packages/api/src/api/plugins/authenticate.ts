import { Elysia } from "elysia";
import repositories from "./ctx";
import logger from "../../logger";

export default function authenticate() {
    return new Elysia({ name: "authenticate" })
        .use(repositories())
        .derive(async ({ headers, db }) => {
            let token = headers["authorization"]?.replace(/^Bearer /, "");
            let user =
                token !== undefined ? await db.user.getByToken(token) : null;
            return { user };
        })
        .onTransform(({ user }) => logger.extend({ user: user?.id }))
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
