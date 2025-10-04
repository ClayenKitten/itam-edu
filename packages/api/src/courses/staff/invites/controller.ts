import { injectable } from "inversify";
import { Elysia, t } from "elysia";
import { REQUIRE_TOKEN } from "../../../ports/http/openapi";
import { HttpError } from "../../../api/errors";
import { AuthenticationPlugin } from "../../../ports/http/authn";
import { InviteQuery } from "./query";
import { CreateInvite } from "./create.interactor";
import { RemoveInvite } from "./remove.interactor";
import { RedeemInvite } from "./redeem.interactor";
import { staffRole } from "../schema";

@injectable()
export class InviteController {
    public constructor(
        private authPlugin: AuthenticationPlugin,
        private query: InviteQuery,
        private create: CreateInvite,
        private remove: RemoveInvite,
        private redeem: RedeemInvite
    ) {}

    public toElysia() {
        return new Elysia({
            name: "invites",
            tags: ["Invites"]
        })
            .use(this.authPlugin.toElysia())
            .get(
                "/courses/invites/:code",
                async ({ user, params, status }) => {
                    const result = await this.query.get(user, params.code);
                    if (result instanceof HttpError) {
                        return status(result.code, result.message);
                    }
                    return result;
                },
                {
                    requireAuthentication: true,
                    params: t.Object({ code: t.String() }),
                    detail: {
                        summary: "Get invite",
                        description:
                            "Returns information about the invite and the course it was created for.",
                        security: REQUIRE_TOKEN
                    }
                }
            )
            .post(
                "/courses/invites/:code/redeem",
                async ({ user, params, status }) => {
                    const result = await this.redeem.invoke(user, params.code);
                    if (result instanceof HttpError) {
                        return status(result.code, result.message);
                    }
                    return result;
                },
                {
                    requireAuthentication: true,
                    params: t.Object({
                        code: t.String()
                    }),
                    detail: {
                        summary: "Redeem invite",
                        description:
                            "Redeems course invite to become member of the course.",
                        security: REQUIRE_TOKEN
                    }
                }
            )
            .get(
                "/courses/:course/invites",
                async ({ user, params, status }) => {
                    const result = await this.query.getAll(user, params.course);
                    if (result instanceof HttpError) {
                        return status(result.code, result.message);
                    }
                    return result;
                },
                {
                    requireAuthentication: true,
                    params: t.Object({ course: t.String({ format: "uuid" }) }),
                    detail: {
                        summary: "Get invites to the course",
                        description: "Returns course invites.",
                        security: REQUIRE_TOKEN
                    }
                }
            )
            .post(
                "/courses/:course/invites",
                async ({ user, params, status, body }) => {
                    const result = await this.create.invoke(
                        user,
                        params.course,
                        body.role
                    );
                    if (result instanceof HttpError) {
                        return status(result.code, result.message);
                    }
                    return result;
                },
                {
                    requireAuthentication: true,
                    params: t.Object({ course: t.String({ format: "uuid" }) }),
                    body: t.Object({
                        role: staffRole
                    }),
                    detail: {
                        summary: "Create invite",
                        description: "Creates course invite.",
                        security: REQUIRE_TOKEN
                    }
                }
            )
            .delete(
                "/courses/:course/invites/:code",
                async ({ user, params, status }) => {
                    const result = await this.remove.invoke(
                        user,
                        params.course,
                        params.code
                    );
                    if (result instanceof HttpError) {
                        return status(result.code, result.message);
                    }
                    return result;
                },
                {
                    requireAuthentication: true,
                    params: t.Object({
                        course: t.String({ format: "uuid" }),
                        code: t.String()
                    }),
                    detail: {
                        summary: "Remove invite",
                        description: "Removes course invite.",
                        security: REQUIRE_TOKEN
                    }
                }
            );
    }
}
