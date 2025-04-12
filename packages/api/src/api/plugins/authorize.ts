import { Elysia } from "elysia";
import authenticate from "./authenticate";
import ctx from "./ctx";
import logger from "../../logger";
import type { CoursePermissions, GlobalPermissions } from "itam-edu-common";

/** Plugin that retrieves user permissions and registers macroses for authorization. */
export default function authorize() {
    return new Elysia({ name: "authorize" })
        .use(ctx())
        .use(authenticate())
        .macro({
            hasPermission(permissions: MaybeArray<keyof GlobalPermissions>) {
                return {
                    resolve: ({ user, error }) => {
                        if (!user) return error(401);
                        const valid = intoArray(permissions).every(key =>
                            user.hasPermission(key)
                        );
                        if (!valid) return error(403);
                        return { user };
                    }
                };
            },
            hasCoursePermission(
                permissions:
                    | MaybeArray<keyof CoursePermissions>
                    | [MaybeArray<keyof CoursePermissions>, number]
            ) {
                let requiredPermissions: Array<keyof CoursePermissions>;
                let responseCode = 403; //Forbidden по умолчанию
                requiredPermissions = intoArray(permissions) as Array<
                    keyof CoursePermissions
                >;
                if (
                    Array.isArray(permissions) &&
                    typeof permissions[1] === "number"
                ) {
                    requiredPermissions = intoArray(permissions[0]) as Array<
                        keyof CoursePermissions
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

                        const valid = requiredPermissions.every(key =>
                            user.hasCoursePermission(courseId, key)
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
