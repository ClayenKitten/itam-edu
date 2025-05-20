import { injectable } from "inversify";
import { Elysia, t } from "elysia";
import { NO_AUTHENTICATION, REQUIRE_TOKEN } from "../../api/plugins/docs";
import { authenticationPlugin } from "../../api/plugins/authenticate";
import { UserRepository } from "../../users/repository";
import { CourseRepository } from "../../courses/repository";
import { StaffRepository } from "./repository";

@injectable()
export class StaffController {
    public constructor(
        protected userRepo: UserRepository,
        protected courseRepo: CourseRepository,
        protected staffRepo: StaffRepository
    ) {}

    public toElysia() {
        return new Elysia({ name: "staff", tags: ["Staff"] })
            .use(authenticationPlugin(this.userRepo))
            .get(
                "/courses/:course/staff",
                async ({ user, params, error }) => {
                    const course = await this.courseRepo.getById(params.course);
                    if (!course) return error(404);

                    const staffIds = await this.staffRepo.getAll(course);
                    const staffMembers = (
                        await Promise.all(
                            staffIds.map(async ({ userId, title }) => {
                                const user =
                                    await this.userRepo.getById(userId);
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
                async ({ user, body, params, error }) => {
                    if (!user.hasCoursePermission(params.course, "isOwner")) {
                        return error(403);
                    }

                    const [course, staffMember] = await Promise.all([
                        this.courseRepo.getById(params.course),
                        this.userRepo.getById(params.staffMember)
                    ]);
                    if (!course || !staffMember) return error(404);

                    await this.staffRepo.set(
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
                async ({ user, params, error }) => {
                    if (!user.hasCoursePermission(params.course, "isOwner")) {
                        return error(403);
                    }

                    const [course, staffMember] = await Promise.all([
                        this.courseRepo.getById(params.course),
                        this.userRepo.getById(params.staffMember)
                    ]);
                    if (!course || !staffMember) return error(404);

                    const success = await this.staffRepo.remove(
                        course,
                        staffMember
                    );
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
}
