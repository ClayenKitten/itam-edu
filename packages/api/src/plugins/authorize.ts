import { Elysia } from "elysia";
import type UserRepository from "../services/user/repository";
import authenticate from "./authenticate";
import db from "./db";

/** Plugin that retrieves user permissions and registers macroses for authorization. */
export default function authorize() {
    return new Elysia({ name: "authorize" })
        .use(db())
        .use(authenticate())
        .derive(async ({ user, db }) => {
            if (!user) return {};
            const permissions = (await db.user.getPermissions(user.id))!;
            return { user, permissions };
        })
        .macro({
            hasPermission(permissions: MaybeArray<UserPermissionNames>) {
                const requiredPerms = ensureIsArray(permissions);
                return {
                    resolve: ({ user, permissions, error }) => {
                        if (!user || !permissions) return error(401);
                        const valid = requiredPerms.every(
                            name => permissions.user[name] === true
                        );
                        if (!valid) return error(403);
                        return { user, permissions };
                    }
                };
            },
            hasCoursePermission(
                permissions: MaybeArray<CoursePermissionNames>
            ) {
                const requiredPerms = ensureIsArray(permissions);
                return {
                    resolve: ({ logger, user, permissions, error, params }) => {
                        if (!user || !permissions) return error(401);

                        const courseId: string | undefined = params["course"];
                        if (courseId === undefined) {
                            logger?.error(
                                "Course authorization applied to handler without `course` path parameter"
                            );
                            return error(403);
                        }
                        const providedPerms = permissions.course[courseId];
                        if (providedPerms === undefined) return error(403);

                        const valid = requiredPerms.every(
                            name => providedPerms[name] === true
                        );
                        if (!valid) return error(403);
                        return { user, permissions };
                    }
                };
            }
        })
        .as("plugin");
}

type Permissions = NonNullable<
    Awaited<ReturnType<UserRepository["getPermissions"]>>
>;
type UserPermissionNames = keyof Permissions["user"];
type CoursePermissionNames = keyof Permissions["course"][number];

type MaybeArray<T> = T | T[];
function ensureIsArray<T>(values: MaybeArray<T>): T[] {
    if (!Array.isArray(values)) return [values];
    else return values;
}
