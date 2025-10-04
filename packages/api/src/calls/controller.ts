import { injectable } from "inversify";
import { Elysia, status, t } from "elysia";
import { REQUIRE_TOKEN } from "../ports/http/openapi";
import { AuthenticationPlugin } from "../ports/http/authn";
import { CallQuery } from "./query";
import { JoinCall } from "./join.interactor";
import { CreateCall } from "./create.interactor";
import { LiveKitWebhookHandler } from "./webhook";
import { HttpError } from "../api/errors";
import { StopCall } from "./stop.interactor";

@injectable()
export class CallController {
    public constructor(
        private authPlugin: AuthenticationPlugin,
        private query: CallQuery,
        private joinInteractor: JoinCall,
        private createCallInteractor: CreateCall,
        private stopCallInteractor: StopCall,
        private webhook: LiveKitWebhookHandler
    ) {}

    public toElysia() {
        return new Elysia({ tags: ["Calls"] })
            .use(this.authPlugin.toElysia())
            .get(
                "/calls",
                async ({ user, status }) => {
                    const result = await this.query.getAll(user);
                    if (result instanceof HttpError) {
                        return status(result.code, result.message);
                    }
                    return result;
                },
                {
                    requireAuthentication: true,
                    detail: {
                        summary: "List calls",
                        description: "Returns all calls.",
                        security: REQUIRE_TOKEN
                    }
                }
            )
            .get(
                "/calls/:call",
                async ({ user, params, status }) => {
                    const result = await this.query.get(user, params.call);
                    if (result instanceof HttpError) {
                        return status(result.code, result.message);
                    }
                    return result;
                },
                {
                    detail: {
                        summary: "Get call",
                        description: "Returns information about the call."
                    }
                }
            )
            .post(
                "/calls/:call/stop",
                async ({ user, params, status }) => {
                    const result = await this.stopCallInteractor.invoke(
                        user,
                        params.call
                    );
                    if (result instanceof HttpError) {
                        return status(result.code, result.message);
                    }
                    return result;
                },
                {
                    requireAuthentication: true,
                    detail: {
                        summary: "Stop a call",
                        description: "Stops a call.",
                        security: REQUIRE_TOKEN
                    },
                    tags: ["Calls"]
                }
            )
            .get(
                "/courses/:course/calls",
                async ({ user, params, status }) => {
                    const result = await this.query.getAllForCourse(
                        user,
                        params.course
                    );
                    if (result instanceof HttpError) {
                        return status(result.code, result.message);
                    }
                    return result;
                },
                {
                    requireAuthentication: true,
                    detail: {
                        summary: "List course calls",
                        description: "Returns all calls for the course.",
                        security: REQUIRE_TOKEN
                    },
                    tags: ["Courses", "Calls"]
                }
            )
            .post(
                "/courses/:course/calls",
                async ({ user, params, body, status }) => {
                    const call = await this.createCallInteractor.invoke(user, {
                        ...body,
                        courseId: params.course
                    });
                    if (call instanceof HttpError) {
                        return status(call.code, call.message);
                    }
                    return call;
                },
                {
                    body: t.Union([
                        t.Object({
                            title: t.String({ minLength: 3, maxLength: 50 })
                        }),
                        t.Object({ lessonId: t.String({ format: "uuid" }) })
                    ]),
                    requireAuthentication: true,
                    detail: {
                        summary: "Create a course call",
                        description: "Creates a course call.",
                        security: REQUIRE_TOKEN
                    },
                    tags: ["Courses", "Calls"]
                }
            )
            .post(
                "/calls/:call/tokens",
                async ({ params, user, status }) => {
                    const result = await this.joinInteractor.invoke(
                        user,
                        params.call
                    );
                    if (result instanceof HttpError) {
                        return status(result.code, result.message);
                    }
                    return result;
                },
                {
                    detail: {
                        summary: "Create access token",
                        description:
                            "Creates an access token that allows the user to join the call.",
                        security: REQUIRE_TOKEN
                    }
                }
            )
            .post(
                "/calls/webhook",
                async ({ request, headers }) => {
                    const body = await request.text();
                    this.webhook.handle(body, headers.authorization);
                },
                {
                    parse: "none",
                    headers: t.Object({
                        authorization: t.String()
                    }),
                    detail: {
                        summary: "LiveKit webhook",
                        description: [
                            "Receive and handle event from LiveKit server.\n",
                            "This endpoint should be specified in LiveKit server configuration as a webhook target."
                        ].join("\n"),
                        externalDocs: {
                            description: "LiveKit webhooks guide",
                            url: "https://docs.livekit.io/home/server/webhooks/"
                        }
                    }
                }
            );
    }
}
