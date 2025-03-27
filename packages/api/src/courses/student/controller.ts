import { Elysia, t } from "elysia";
import initContext from "../../api/plugins";

export function studentController<PREFIX extends string>(prefix: PREFIX) {
    return new Elysia({ name: "students", prefix, tags: ["Students"] })
        .use(initContext())
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
                const students = await db.student.getAll(params.course);
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
                const student = await db.student.addStudent(
                    params.course,
                    params.student
                );
                if (!student)
                    return error(
                        409,
                        "User is already enrolled to the course."
                    );
                return student;
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
                const success = await db.student.expelStudent(
                    params.course,
                    params.student
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
                    description: "Expels a specified student from the course."
                }
            }
        );
}
