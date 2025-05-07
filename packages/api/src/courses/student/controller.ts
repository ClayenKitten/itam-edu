import { Elysia, t } from "elysia";
import type { AppContext } from "../../ctx";
import { authenticationPlugin } from "../../api/plugins/authenticate";

export function studentController(ctx: AppContext) {
    return new Elysia({
        name: "students",
        prefix: "/courses/:course/students",
        tags: ["Students"]
    })
        .derive(() => ctx)
        .use(authenticationPlugin(ctx))
        .guard({
            params: t.Object(
                { course: t.String({ format: "uuid" }) },
                { additionalProperties: true }
            )
        })
        .get(
            "",
            async ({ user, db, params, error }) => {
                if (!user.isCourseStaff(params.course)) return error(403);

                const course = await db.course.getById(params.course);
                if (!course) return error(404);

                const enrollments = await db.student.getAll(course);
                const students = (
                    await Promise.all(
                        enrollments.map(userId => db.user.getById(userId))
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
                    description: "Returns all students enrolled to the course."
                }
            }
        )
        .post(
            "/:student",
            async ({ db, user, params, error }) => {
                if (
                    user.id !== params.student &&
                    !user.isCourseStaff(params.course)
                ) {
                    return error(403);
                }

                const [course, student] = await Promise.all([
                    db.course.getById(params.course),
                    db.user.getById(params.student)
                ]);
                if (!course || !student) return null;

                if (!course.canEnrollStudents) {
                    return error(400, "Course doesn't accept enrollments");
                }

                const enrollment = await db.student.set(course, student);
                if (!enrollment)
                    return error(
                        409,
                        "User is already enrolled to the course."
                    );
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
            async ({ db, user, params, error }) => {
                if (
                    user.id !== params.student &&
                    !user.isCourseStaff(params.course)
                ) {
                    return error(403);
                }

                const [course, student] = await Promise.all([
                    db.course.getById(params.course),
                    db.user.getById(params.student)
                ]);
                if (!course || !student) return null;

                const success = await db.student.remove(course, student);
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
                    description: "Expels a specified student from the course."
                }
            }
        );
}
