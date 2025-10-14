import { injectable } from "inversify";
import { Elysia, t } from "elysia";
import * as schema from "./schema";
import { REQUIRE_TOKEN } from "../../../ports/http/openapi";
import { HttpError } from "../../../api/errors";
import { AuthenticationPlugin } from "../../../ports/http/authn";
import { HomeworkQuery } from "./query";
import { CreateHomework } from "./create.interactor";
import { UpdateHomework } from "./update.interactor";
import { ReorderHomeworks } from "./reorder.interactor";

@injectable()
export class HomeworkController {
    public constructor(
        private authPlugin: AuthenticationPlugin,
        private query: HomeworkQuery,
        private createInteractor: CreateHomework,
        private updateInteractor: UpdateHomework,
        private reorderInteractor: ReorderHomeworks
    ) {}

    public toElysia() {
        return (
            new Elysia({
                name: "homeworks",
                prefix: "/courses/:course/homeworks",
                tags: ["Homeworks"]
            })
                .use(this.authPlugin.toElysia())
                .get(
                    "",
                    async ({ user, params, status }) => {
                        const result = await this.query.getAll(
                            user,
                            params.course
                        );
                        if (result instanceof HttpError) {
                            return status(result.code, result.message);
                        }
                        return result;
                    },
                    {
                        params: t.Object({
                            course: t.String({ format: "uuid" })
                        }),
                        detail: {
                            summary: "List homeworks",
                            description: "Returns all homeworks of the course."
                        }
                    }
                )
                .post(
                    "",
                    async ({ user, params, body, status }) => {
                        const result = await this.createInteractor.invoke(
                            user,
                            params.course,
                            body
                        );
                        if (result instanceof HttpError) {
                            return status(result.code, result.message);
                        }
                        return result.toDTO();
                    },
                    {
                        requireAuthentication: true,
                        body: schema.createHomework,
                        params: t.Object({
                            course: t.String({ format: "uuid" })
                        }),
                        detail: {
                            summary: "Create new homework",
                            description: "Creates new homework.",
                            security: REQUIRE_TOKEN
                        }
                    }
                )
                .put(
                    "",
                    async ({ user, params, body, status }) => {
                        const result = await this.reorderInteractor.invoke(
                            user,
                            params.course,
                            body.homeworks
                        );
                        if (result instanceof HttpError) {
                            return status(result.code, result.message);
                        }
                    },
                    {
                        requireAuthentication: true,
                        body: t.Object({
                            homeworks: schema.reorderHomeworksList
                        }),
                        params: t.Object({
                            course: t.String({ format: "uuid" })
                        }),
                        detail: {
                            summary: "Update homeworks",
                            description:
                                "Updates homeworks list ordering. If homework is not present, it is deleted.",
                            security: REQUIRE_TOKEN
                        }
                    }
                )
                .get(
                    "/:homework",
                    async ({ user, params, status }) => {
                        const result = await this.query.get(
                            user,
                            params.course,
                            params.homework
                        );
                        if (result instanceof HttpError) {
                            return status(result.code, result.message);
                        }
                        return result;
                    },
                    {
                        params: t.Object({
                            course: t.String({ format: "uuid" }),
                            homework: t.String({ format: "uuid" })
                        }),
                        detail: {
                            summary: "Get homework",
                            description: "Returns homework."
                        }
                    }
                )
                //TO-DO:
                .put(
                    "/:homework",
                    async ({ user, params, body, status }) => {
                        const result = await this.updateInteractor.invoke(
                            user,
                            params.course,
                            params.homework,
                            body
                        );
                        if (result instanceof HttpError) {
                            return status(result.code, result.message);
                        }
                        return result.toDTO();
                    },
                    {
                        requireAuthentication: true,
                        params: t.Object({
                            course: t.String({ format: "uuid" }),
                            homework: t.String({ format: "uuid" })
                        }),
                        body: t.Intersect([
                            schema.updateHomework,
                            t.Object({
                                skipNotification: t.Optional(t.Boolean())
                            })
                        ]),
                        detail: {
                            summary: "Update homework",
                            description: "Updates homework.",
                            security: REQUIRE_TOKEN
                        }
                    }
                )
        );
    }
}
