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
            async ({ db, params }) => {
                const students = await db.student.getAll(params.course);
                return students;
            },
            {
                hasPermission: "isStaff",
                detail: {
                    summary: "List students",
                    description: "Returns all students enrolled to the course."
                }
            }
        );
}
