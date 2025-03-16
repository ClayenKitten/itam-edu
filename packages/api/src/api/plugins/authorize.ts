import { Elysia } from "elysia";
import * as schema from "../../users/schema";
import authenticate from "./authenticate";
import db from "./db";
import logger from "../../logger";

/** Plugin that retrieves user permissions and registers macroses for authorization. */
export default function authorize() {
    return new Elysia({ name: "authorize" })
        .use(db())
        .use(authenticate())
        .macro({
            hasPermission(
                permissions: MaybeArray<
                    keyof typeof schema.globalPermissions.static
                >
            ) {
                return {
                    resolve: ({ user, error }) => {
                        if (!user) return error(401);
                        const valid = intoArray(permissions).every(
                            key => user.permissions.global[key] === true
                        );
                        if (!valid) return error(403);
                        return { user };
                    }
                };
            },
            hasCoursePermission(
                permissions:
                    | MaybeArray<keyof typeof schema.coursePermissions.static>
                    | [
                          MaybeArray<
                              keyof typeof schema.coursePermissions.static
                          >,
                          number
                      ]
            ) {
                let requiredPermissions: Array<
                    keyof typeof schema.coursePermissions.static
                >;
                let responseCode = 403; //Forbidden по умолчанию
                requiredPermissions = intoArray(permissions) as Array<
                    keyof typeof schema.coursePermissions.static
                >;
                if (
                    Array.isArray(permissions) &&
                    typeof permissions[1] === "number"
                ) {
                    requiredPermissions = intoArray(permissions[0]) as Array<
                        keyof typeof schema.coursePermissions.static
                    >;
                    responseCode = permissions[1];
                }

                return {
                    resolve: ({ user, error, params }) => {
                        if (!user) return error(401);

                        const courseId: string | undefined = params["course"];
                        if (courseId === undefined) {
                            logger?.error(
                                "Course authorization applied to handler without `course` path parameter"
                            );
                            return error(403);
                        }

                        const valid = requiredPermissions.every(
                            key =>
                                user.permissions.course(courseId)?.[key] ===
                                true
                        );
                        if (!valid) return error(responseCode);
                        return { user };
                    }
                };
            }
        })
        .as("plugin");
}

type MaybeArray<T> = T | T[];
function intoArray<T>(values: MaybeArray<T>): T[] {
    if (!Array.isArray(values)) return [values];
    else return values;
}
