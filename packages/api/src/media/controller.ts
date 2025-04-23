import { Elysia, t } from "elysia";
import authorizeMedia, { isSupportedMethod } from "./authorization";
import type { AppContext } from "../ctx";
import { authenticationPlugin } from "../api/plugins/authenticate";

export async function mediaController(ctx: AppContext) {
    return new Elysia({ prefix: "/media", tags: ["Media"] })
        .derive(() => ctx)
        .use(authenticationPlugin(ctx))
        .get(
            "/access",
            async ({ db, user, headers, error }) => {
                const method = headers["x-forwarded-method"];
                if (!isSupportedMethod(method)) return error(405);
                const path = headers["x-forwarded-uri"];

                const authorized = await authorizeMedia({ user }, method, path);
                return authorized ? "Ok" : error(404);
            },
            {
                headers: t.Object({
                    "x-forwarded-method": t.String(),
                    "x-forwarded-uri": t.String()
                }),
                detail: {
                    summary: "Authorize media access",
                    description: "Authorizes media resource access."
                }
            }
        );
}
