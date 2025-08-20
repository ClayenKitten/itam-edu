import { Elysia } from "elysia";
import logger from "../../logger";
import type { CoursePermissions, GlobalPermissions } from "itam-edu-common";
import { UserRepository } from "../../users/repository";
import { SessionRepository } from "../../users/session";
import { injectable } from "inversify";

/** Retrieves user information and permissions, registers macroses for authorization. */
@injectable()
export class AuthenticationPlugin {
    public constructor(
        protected sessionRepo: SessionRepository,
        protected userRepo: UserRepository
    ) {}

    public toElysia() {
        return new Elysia({ name: "authenticate" })
            .derive(async ({ headers, cookie }) => {
                let token =
                    headers["authorization"]?.replace(/^Bearer /, "") ||
                    cookie["itam-edu-token"]?.value;
                if (!token) return { session: null, user: null };

                const session = await this.sessionRepo.getByToken(token);
                if (!session) return { session: null, user: null };

                let user = await this.userRepo.getById(session.userId);
                return { session, user };
            })
            .onTransform(({ user }) => logger.extend({ user: user?.id }))
            .macro({
                requireAuthentication: {
                    resolve: ({ session, user, status }) => {
                        if (!session || !user)
                            return status(401, "Authentication required");
                        return { session, user };
                    }
                }
            })
            .macro({
                hasPermission(
                    permissions: MaybeArray<keyof GlobalPermissions>
                ) {
                    return {
                        resolve: ({ user, status }) => {
                            if (!user)
                                return status(401, "Authentication required");
                            const valid = intoArray(permissions).every(key =>
                                user.hasPermission(key)
                            );
                            if (!valid) return status(401, "Incorrect token");
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
                        requiredPermissions = intoArray(
                            permissions[0]
                        ) as Array<keyof CoursePermissions>;
                        responseCode = permissions[1];
                    }

                    return {
                        resolve: ({ user, status, params }) => {
                            if (!user) return status(401);

                            const courseId: string | undefined =
                                params["course"];
                            if (courseId === undefined) {
                                logger?.error(
                                    "Course authorization applied to handler without `course` path parameter"
                                );
                                return status(500);
                            }

                            const valid = requiredPermissions.every(key =>
                                user.hasCoursePermission(courseId, key)
                            );
                            if (!valid) return status(responseCode);
                            return { user };
                        }
                    };
                }
            })
            .as("scoped");
    }
}

type MaybeArray<T> = T | T[];
function intoArray<T>(values: MaybeArray<T>): T[] {
    if (!Array.isArray(values)) return [values];
    else return values;
}
