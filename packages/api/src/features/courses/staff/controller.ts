import { injectable } from "inversify";
import { Elysia, t } from "elysia";
import { NO_AUTHENTICATION, REQUIRE_TOKEN } from "../../../ports/http/openapi";
import { AuthenticationPlugin } from "../../../ports/http/authn";
import { HttpError } from "../../../api/errors";
import { UserRepository } from "../../users/repository";
import { CourseRepository } from "../repository";
import { StaffQuery } from "./query";
import { EditStaffMemberRole } from "./editRole.interactor";
import { RemoveStaffMember } from "./remove.interactor";
import * as schema from "./schema";

@injectable()
export class StaffController {
    public constructor(
        protected authPlugin: AuthenticationPlugin,
        protected userRepo: UserRepository,
        protected courseRepo: CourseRepository,
        protected query: StaffQuery,
        protected editRoleInteractor: EditStaffMemberRole,
        protected removeInteractor: RemoveStaffMember
    ) {}

    public toElysia() {
        return new Elysia({
            name: "staff",
            prefix: "/courses/:course/staff",
            tags: ["Staff"]
        })
            .use(this.authPlugin.toElysia())
            .derive(async ({ params, status }) => {
                const course = await this.courseRepo.getById(params.course);
                if (!course) return status(404, "Course not found.");
                return { course };
            })
            .get(
                "",
                async ({ user, course, status }) => {
                    const staff = await this.query.getAll(user, course);
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
                            const staffMember = await this.userRepo.getById(
                                params.staffMember
                            );
                            if (!staffMember)
                                return status(404, "User not found.");
                            return { staffMember };
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
                                const result =
                                    await this.editRoleInteractor.invoke(
                                        user,
                                        course,
                                        staffMember,
                                        body.role
                                    );
                                if (result instanceof HttpError) {
                                    return status(result.code, result.message);
                                }
                            },
                            {
                                requireAuthentication: true,
                                body: t.Object({
                                    role: schema.staffRole
                                }),
                                detail: {
                                    summary: "Change staff member's role",
                                    description:
                                        "Changes role of the staff member.",
                                    security: REQUIRE_TOKEN
                                }
                            }
                        )
                        .delete(
                            "",
                            async ({ user, course, staffMember, status }) => {
                                const result =
                                    await this.removeInteractor.invoke(
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
                                    summary: "Remove staff member",
                                    description:
                                        "Removes staff member from the course.",
                                    security: REQUIRE_TOKEN
                                }
                            }
                        )
            );
    }
}
