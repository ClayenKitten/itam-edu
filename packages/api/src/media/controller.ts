import { Elysia, t } from "elysia";
import initContext from "../api/plugins";
import authorizeMedia, { isSupportedMethod } from "./authorization";

export async function mediaController() {
    return new Elysia({ prefix: "/media", tags: ["Media"] })
        .use(initContext())
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
