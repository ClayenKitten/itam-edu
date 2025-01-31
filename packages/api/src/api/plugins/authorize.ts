import { Elysia } from "elysia";
import * as schema from "../users/schema";
import authenticate from "./authenticate";
import db from "./db";

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
                permissions: MaybeArray<
                    keyof typeof schema.coursePermissions.static
                >
            ) {
                const requiredPerms = intoArray(permissions);
                return {
                    resolve: ({ logger, user, error, params }) => {
                        if (!user) return error(401);

                        const courseId: string | undefined = params["course"];
                        if (courseId === undefined) {
                            logger?.error(
                                "Course authorization applied to handler without `course` path parameter"
                            );
                            return error(403);
                        }

                        const valid = intoArray(permissions).every(
                            key =>
                                user.permissions.course(courseId)?.[key] ===
                                true
                        );
                        if (!valid) return error(403);
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
