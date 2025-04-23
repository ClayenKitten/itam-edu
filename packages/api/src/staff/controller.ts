import { Elysia, t } from "elysia";
import { NO_AUTHENTICATION, REQUIRE_TOKEN } from "../api/plugins/docs";
import type { AppContext } from "../ctx";
import { authenticationPlugin } from "../api/plugins/authenticate";

export function staffController(ctx: AppContext) {
    return new Elysia({ name: "staff", tags: ["Staff"] })
        .derive(() => ctx)
        .use(authenticationPlugin(ctx))
        .get(
            "/courses/:course/staff",
            async ({ user, db, params, error }) => {
                const course = await db.course.getById(params.course);
                if (!course) return error(404);

                const staffIds = await db.staff.getAll(course);
                const staffMembers = (
                    await Promise.all(
                        staffIds.map(async ({ userId, title }) => {
                            const user = await db.user.getById(userId);
                            if (!user) return null;
                            return {
                                user: {
                                    id: user.id,
                                    firstName: user.info.firstName,
                                    lastName: user.info.lastName,
                                    patronim: user.info.patronim,
                                    bio: user.info.bio,
                                    avatar: user.info.avatar,
                                    tgUsername: user.telegram.username
                                },
                                title
                            };
                        })
                    )
                ).filter(s => s !== null);
                return staffMembers;
            },
            {
                params: t.Object({
                    course: t.String({ format: "uuid" })
                }),
                detail: {
                    summary: "List staff members",
                    description: "Returns all staff members of the course.",
                    security: NO_AUTHENTICATION
                }
            }
        )
        .put(
            "/courses/:course/staff/:staffMember",
            async ({ db, user, body, params, error }) => {
                if (!user.hasCoursePermission(params.course, "isOwner")) {
                    return error(403);
                }

                const [course, staffMember] = await Promise.all([
                    db.course.getById(params.course),
                    db.user.getById(params.staffMember)
                ]);
                if (!course || !staffMember) return error(404);

                await db.staff.set(
                    course,
                    staffMember,
                    body.title,
                    body.permissions
                );
            },
            {
                requireAuthentication: true,
                params: t.Object({
                    course: t.String({ format: "uuid" }),
                    staffMember: t.String({ format: "uuid" })
                }),
                body: t.Object({
                    title: t.String(),
                    permissions: t.Object({
                        isOwner: t.Boolean(),
                        canEditInfo: t.Boolean(),
                        canEditContent: t.Boolean(),
                        canManageSubmissions: t.Boolean()
                    })
                }),
                detail: {
                    summary: "Promote staff member",
                    description: "Promotes staff member to the course.",
                    security: REQUIRE_TOKEN
                }
            }
        )
        .delete(
            "/courses/:course/staff/:staffMember",
            async ({ db, user, params, error }) => {
                if (!user.hasCoursePermission(params.course, "isOwner")) {
                    return error(403);
                }

                const [course, staffMember] = await Promise.all([
                    db.course.getById(params.course),
                    db.user.getById(params.staffMember)
                ]);
                if (!course || !staffMember) return error(404);

                const success = await db.staff.remove(course, staffMember);
                if (!success) return error(404);
            },
            {
                requireAuthentication: true,
                params: t.Object({
                    course: t.String({ format: "uuid" }),
                    staffMember: t.String({ format: "uuid" })
                }),
                detail: {
                    summary: "Demote staff member",
                    description: "Demotes staff member from the course.",
                    security: REQUIRE_TOKEN
                }
            }
        );
}
