import { injectable } from "inversify";
import { Elysia, t } from "elysia";
import { authenticationPlugin } from "../../api/plugins/authenticate";
import { UserRepository } from "../../users/repository";
import { CourseRepository } from "../repository";
import { StudentRepository } from "./repository";

@injectable()
export class StudentController {
    public constructor(
        protected userRepo: UserRepository,
        protected courseRepo: CourseRepository,
        protected studentRepo: StudentRepository
    ) {}

    public toElysia() {
        return new Elysia({
            name: "students",
            prefix: "/courses/:course/students",
            tags: ["Students"]
        })
            .use(authenticationPlugin(this.userRepo))
            .guard({
                params: t.Object(
                    { course: t.String({ format: "uuid" }) },
                    { additionalProperties: true }
                )
            })
            .get(
                "",
                async ({ user, params, error }) => {
                    if (!user.isCourseStaff(params.course)) return error(403);

                    const course = await this.courseRepo.getById(params.course);
                    if (!course) return error(404);

                    const enrollments = await this.studentRepo.getAll(course);
                    const students = (
                        await Promise.all(
                            enrollments.map(userId =>
                                this.userRepo.getById(userId)
                            )
                        )
                    )
                        .filter(s => s !== null)
                        .map(s => ({
                            user: {
                                id: s.id,
                                firstName: s.info.firstName,
                                lastName: s.info.lastName,
                                patronim: s.info.patronim,
                                bio: s.info.bio,
                                avatar: s.info.avatar,
                                tgUsername: s.telegram.username
                            }
                        }));

                    return students;
                },
                {
                    requireAuthentication: true,
                    params: t.Object({ course: t.String({ format: "uuid" }) }),
                    detail: {
                        summary: "List students",
                        description:
                            "Returns all students enrolled to the course."
                    }
                }
            )
            .put(
                "/:student",
                async ({ user, params, error }) => {
                    if (
                        user.id !== params.student &&
                        !user.isCourseStaff(params.course)
                    ) {
                        return error(403);
                    }

                    const [course, student] = await Promise.all([
                        this.courseRepo.getById(params.course),
                        this.userRepo.getById(params.student)
                    ]);
                    if (!course || !student) return null;

                    if (!course.canEnrollStudents) {
                        return error(400, "Course doesn't accept enrollments");
                    }

                    const enrollment = await this.studentRepo.set(
                        course,
                        student
                    );
                    if (!enrollment) {
                        return error(
                            409,
                            "User is already enrolled to the course."
                        );
                    }

                    return enrollment;
                },
                {
                    requireAuthentication: true,
                    params: t.Object({
                        course: t.String({ format: "uuid" }),
                        student: t.String({ format: "uuid" })
                    }),
                    detail: {
                        summary: "Enroll student",
                        description: "Enrolls student in the course."
                    }
                }
            )
            .delete(
                "/:student",
                async ({ user, params, error }) => {
                    if (
                        user.id !== params.student &&
                        !user.isCourseStaff(params.course)
                    ) {
                        return error(403);
                    }

                    const [course, student] = await Promise.all([
                        this.courseRepo.getById(params.course),
                        this.userRepo.getById(params.student)
                    ]);
                    if (!course || !student) return null;

                    const success = await this.studentRepo.remove(
                        course,
                        student
                    );
                    if (!success) return error(404);
                },
                {
                    requireAuthentication: true,
                    params: t.Object({
                        course: t.String({ format: "uuid" }),
                        student: t.String({ format: "uuid" })
                    }),
                    detail: {
                        summary: "Expel student",
                        description:
                            "Expels a specified student from the course."
                    }
                }
            );
    }
}
