import { injectable } from "inversify";
import { Elysia, t } from "elysia";
import { authenticationPlugin } from "../../api/plugins/authenticate";
import { UserRepository } from "../../users/repository";
import { CourseRepository } from "../repository";
import { StudentQuery } from "./query";
import { EnrollStudent } from "./enroll";
import { ExpelStudent } from "./expel";
import { HttpError } from "../../api/errors";
import { REQUIRE_TOKEN } from "../../api/plugins/docs";

@injectable()
export class StudentController {
    public constructor(
        protected userRepo: UserRepository,
        protected courseRepo: CourseRepository,
        protected query: StudentQuery,
        protected enroll: EnrollStudent,
        protected expel: ExpelStudent
    ) {}

    public toElysia() {
        return new Elysia({
            name: "students",
            prefix: "/courses/:course/students",
            tags: ["Students"]
        })
            .use(authenticationPlugin(this.userRepo))
            .get(
                "",
                async ({ user, params, status }) => {
                    const course = await this.courseRepo.getById(params.course);
                    if (!course) return status(404);

                    const students = await this.query.getAll(user, course);
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
                        .derive(async ({ params, status }) => {
                            const [course, student] = await Promise.all([
                                this.courseRepo.getById(params.course),
                                this.userRepo.getById(params.student)
                            ]);
                            if (!course || !student) return status(404);
                            return { course, student };
                        })
                        .put(
                            "",
                            async ({ user, course, student, status }) => {
                                const result = await this.enroll.invoke(
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
                                const result = await this.expel.invoke(
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
