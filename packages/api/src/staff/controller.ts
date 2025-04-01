import { Elysia, t } from "elysia";
import initContext from "../api/plugins";
import { coursePermissions } from "../users/schema";
import { NO_AUTHENTICATION, REQUIRE_TOKEN } from "../api/plugins/docs";

export function staffController() {
    return new Elysia({ name: "staff", tags: ["Staff"] })
        .use(initContext())
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
                                user: user.toPublicDTO(),
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
                console.log(user.permissions);
                if (user.permissions.course(params.course)?.isOwner !== true) {
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
                    permissions: coursePermissions
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
                if (user.permissions.course(params.course)?.isOwner !== true) {
                    return error(401);
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
