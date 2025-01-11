import { createMiddleware } from "hono/factory";
import type { AppEnv } from "../ctx.js";
import type { Context } from "hono";
import type UserRepository from "../services/user/repository.js";

const authorize = (callback: AuthzCallback) =>
    createMiddleware<AppEnv>(async (c, next) => {
        if (!c.var.user) return c.text("Forbidden", 403);

        const permissions = await c.var.repo.user.getPermissionsMap(
            c.var.user.id
        );
        if (!permissions) return c.text("Forbidden", 403);

        const allowed = await callback(permissions, c);
        if (!allowed) return c.text("Forbidden", 403);

        await next();
    });
export default authorize;

export type AuthzCallback = (
    permissions: Permissions,
    ctx: Context<AppEnv>
) => boolean | Promise<boolean>;

type Permissions = NonNullable<
    Awaited<ReturnType<UserRepository["getPermissionsMap"]>>
>;
