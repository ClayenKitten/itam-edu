import { injectable } from "inversify";
import { Elysia, t } from "elysia";
import { REQUIRE_TOKEN } from "../api/plugins/docs";
import { AuthenticationPlugin } from "../api/plugins/authenticate";
import { CourseRepository } from "../courses/repository";
import { CallService } from "./service";

@injectable()
export class CallController {
    public constructor(
        protected authPlugin: AuthenticationPlugin,
        protected courseRepo: CourseRepository,
        protected callService: CallService
    ) {}

    public toElysia() {
        return new Elysia({ tags: ["Calls"] })
            .use(this.authPlugin.toElysia())
            .get(
                "/calls",
                async () => {
                    const calls = await this.callService.getAll();
                    return calls.map(call => ({
                        id: call.id,
                        ...call.metadata
                    }));
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
                async ({ params, error }) => {
                    const call = await this.callService.getById(params.call);
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
                async ({ user, body }) => {
                    const call = await this.callService.create(
                        user,
                        body.title
                    );
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
                async ({ params, user, status }) => {
                    const call = await this.callService.getById(params.call);
                    if (!call) return status(404);

                    const token = await this.callService.createAccessToken(
                        user,
                        call
                    );
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
}
