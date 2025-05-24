import { injectable } from "inversify";
import { Elysia, t } from "elysia";
import { NO_AUTHENTICATION, REQUIRE_TOKEN } from "../../api/plugins/docs";
import { authenticationPlugin } from "../../api/plugins/authenticate";
import { HttpError } from "../../api/errors";
import { UserRepository } from "../../users/repository";
import { CourseRepository } from "../../courses/repository";
import { StaffQuery } from "./query";
import { PromoteStaff } from "./promote";
import { DemoteStaff } from "./demote";

@injectable()
export class StaffController {
    public constructor(
        protected userRepo: UserRepository,
        protected courseRepo: CourseRepository,
        protected query: StaffQuery,
        protected promote: PromoteStaff,
        protected demote: DemoteStaff
    ) {}

    public toElysia() {
        return new Elysia({
            name: "staff",
            prefix: "/courses/:course/staff",
            tags: ["Staff"]
        })
            .use(authenticationPlugin(this.userRepo))
            .get(
                "",
                async ({ params, status }) => {
                    const course = await this.courseRepo.getById(params.course);
                    if (!course) return status(404);

                    const staff = await this.query.getAll(course);
                    if (staff instanceof HttpError) {
                        return status(staff.code, staff.message);
                    }
                    return staff;
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
            .group(
                "/:staffMember",
                {
                    params: t.Object({
                        course: t.String({ format: "uuid" }),
                        staffMember: t.String({ format: "uuid" })
                    })
                },
                app =>
                    app
                        .derive(async ({ params, status }) => {
                            const [course, staffMember] = await Promise.all([
                                this.courseRepo.getById(params.course),
                                this.userRepo.getById(params.staffMember)
                            ]);
                            if (!course || !staffMember) return status(404);
                            return { course, staffMember };
                        })
                        .put(
                            "",
                            async ({
                                user,
                                body,
                                course,
                                staffMember,
                                status
                            }) => {
                                const result = await this.promote.invoke(
                                    user,
                                    course,
                                    staffMember,
                                    body.title,
                                    body.permissions
                                );
                                if (result instanceof HttpError) {
                                    return status(result.code, result.message);
                                }
                            },
                            {
                                requireAuthentication: true,
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
                                    description:
                                        "Promotes staff member to the course.",
                                    security: REQUIRE_TOKEN
                                }
                            }
                        )
                        .delete(
                            "",
                            async ({ user, course, staffMember, status }) => {
                                const result = await this.demote.invoke(
                                    user,
                                    course,
                                    staffMember
                                );
                                if (result instanceof HttpError) {
                                    return status(result.code, result.message);
                                }
                            },
                            {
                                requireAuthentication: true,
                                detail: {
                                    summary: "Demote staff member",
                                    description:
                                        "Demotes staff member from the course.",
                                    security: REQUIRE_TOKEN
                                }
                            }
                        )
            );
    }
}
