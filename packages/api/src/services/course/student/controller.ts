import { Elysia, t } from "elysia";
import initContext from "../../../plugins";

export function studentController(prefix: string) {
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
            { hasPermission: "isStaff" }
        );
}
