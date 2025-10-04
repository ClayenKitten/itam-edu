import { injectable } from "inversify";
import { Elysia, t } from "elysia";
import { AuthenticationPlugin } from "../../../ports/http/authn";
import { UserRepository } from "../../users/repository";
import { CourseRepository } from "../repository";
import { StudentQuery } from "./query";
import { EnrollStudent } from "./enroll.interactor";
import { ExpelStudent } from "./expel.interactor";
import { HttpError } from "../../../api/errors";
import { REQUIRE_TOKEN } from "../../../ports/http/openapi";

@injectable()
export class StudentController {
    public constructor(
        protected authPlugin: AuthenticationPlugin,
        protected userRepo: UserRepository,
        protected courseRepo: CourseRepository,
        protected query: StudentQuery,
        protected enrollInteractor: EnrollStudent,
        protected expelInteractor: ExpelStudent
    ) {}

    public toElysia() {
        return new Elysia({
            name: "students",
            prefix: "/courses/:course/students",
            tags: ["Students"]
        })
            .use(this.authPlugin.toElysia())
            .derive(async ({ params, status }) => {
                const course = await this.courseRepo.getById(params.course);
                if (!course) return status(404, "Course not found.");
                return { course };
            })
            .get(
                "",
                async ({ user, params, status }) => {
                    const students = await this.query.getAll(
                        user,
                        params.course
                    );
                    if (students instanceof HttpError) {
                        return status(students.code, students.message);
                    }
                    return students;
                },
                {
                    requireAuthentication: true,
                    params: t.Object({ course: t.String({ format: "uuid" }) }),
                    detail: {
                        summary: "List students",
                        description:
                            "Returns all students enrolled to the course.",
                        security: REQUIRE_TOKEN
                    }
                }
            )
            .group(
                "/:student",
                {
                    params: t.Object({
                        course: t.String({ format: "uuid" }),
                        student: t.String({ format: "uuid" })
                    })
                },
                app =>
                    app
                        .derive(async ({ course, params, status }) => {
                            const student = await this.userRepo.getById(
                                params.student
                            );
                            if (!student) return status(404, "User not found.");
                            return { course, student };
                        })
                        .put(
                            "",
                            async ({ user, course, student, status }) => {
                                const result =
                                    await this.enrollInteractor.invoke(
                                        user,
                                        course,
                                        student
                                    );
                                if (result instanceof HttpError) {
                                    return status(result.code, result.message);
                                }
                            },
                            {
                                requireAuthentication: true,
                                detail: {
                                    summary: "Enroll student",
                                    description:
                                        "Enrolls student in the course.",
                                    security: REQUIRE_TOKEN
                                }
                            }
                        )
                        .delete(
                            "",
                            async ({ user, course, student, status }) => {
                                const result =
                                    await this.expelInteractor.invoke(
                                        user,
                                        course,
                                        student
                                    );
                                if (result instanceof HttpError) {
                                    return status(result.code, result.message);
                                }
                            },
                            {
                                requireAuthentication: true,
                                detail: {
                                    summary: "Expel student",
                                    description:
                                        "Expels a specified student from the course.",
                                    security: REQUIRE_TOKEN
                                }
                            }
                        )
            );
    }
}
