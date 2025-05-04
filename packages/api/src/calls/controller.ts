import { Elysia, t } from "elysia";
import { REQUIRE_TOKEN } from "../api/plugins/docs";
import type { AppContext } from "../ctx";
import { authenticationPlugin } from "../api/plugins/authenticate";

export async function callController(ctx: AppContext) {
    return new Elysia({ tags: ["Calls"] })
        .derive(() => ctx)
        .use(authenticationPlugin(ctx))
        .get(
            "/calls",
            async ({ services }) => {
                const calls = await services.call.getAll();
                return calls.map(call => ({ id: call.id, ...call.metadata }));
            },
            {
                detail: {
                    summary: "List calls",
                    description: "Returns all ongoing calls.",
                    security: REQUIRE_TOKEN
                }
            }
        )
        .get(
            "/calls/:call",
            async ({ params, services, error }) => {
                const call = await services.call.getById(params.call);
                if (!call) return error(404);
                return { id: call.id, ...call.metadata };
            },
            {
                detail: {
                    summary: "Get call",
                    description: "Returns information about the call.",
                    security: REQUIRE_TOKEN
                }
            }
        )
        .post(
            "/calls",
            async ({ user, services, body }) => {
                const call = await services.call.create(user, body.title);
                return { id: call.id, ...call.metadata };
            },
            {
                body: t.Object({
                    title: t.String({ maxLength: 30 })
                }),
                requireAuthentication: true,
                detail: {
                    summary: "Create a call",
                    description: "Creates a call.",
                    security: REQUIRE_TOKEN
                }
            }
        )
        .post(
            "/calls/:call/tokens",
            async ({ params, user, services, error }) => {
                const call = await services.call.getById(params.call);
                if (!call) return error(404);

                const token = await services.call.createAccessToken(user, call);
                return { token };
            },
            {
                requireAuthentication: true,
                detail: {
                    summary: "Create access token",
                    description:
                        "Creates an access token that allows the user to join the call.",
                    security: REQUIRE_TOKEN
                }
            }
        );
}
