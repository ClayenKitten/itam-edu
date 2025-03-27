import { Elysia, t } from "elysia";
import initContext from "../../api/plugins";

export function studentController<PREFIX extends string>(prefix: PREFIX) {
    return new Elysia({ name: "students", prefix, tags: ["Students"] })
        .use(initContext())
        .guard({
            params: t.Object({ course: t.String({ format: "uuid" }) })
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
                return await db.student.addStudent(
                    params.course,
                    params.student
                );
            },
            {
                requireAuthentication: true,
                params: t.Object({
                    course: t.String({ format: "uuid" }),
                    student: t.String({ format: "uuid" })
                }),
                detail: {
                    summary: "Add student to course",
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
                return await db.student.removeStudent(
                    params.course,
                    params.student
                );
            },
            {
                requireAuthentication: true,
                params: t.Object({
                    course: t.String({ format: "uuid" }),
                    student: t.String({ format: "uuid" })
                }),
                detail: {
                    summary: "Delete student from course",
                    description:
                        "Deletes a specified student who is enrolled in the course."
                }
            }
        );
}
