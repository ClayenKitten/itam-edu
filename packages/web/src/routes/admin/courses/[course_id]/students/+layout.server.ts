import api from "$lib/api";
import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ fetch, params, depends }) => {
    depends("app:students");
    const students = await getStudents(fetch, params.course_id);
    return { students };
};

async function getStudents(fetch: typeof window.fetch, course: string) {
    const studentsResp = await api({ fetch })
        .courses({ course })
        .students.get();
    if (studentsResp.error) error(studentsResp.status);
    return studentsResp.data;
}
