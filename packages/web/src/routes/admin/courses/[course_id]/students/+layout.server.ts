import api from "$lib/api";
import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ fetch, params }) => {
    const studentsResp = await api({ fetch }).courses[":course"].students.$get({
        param: { course: params.course_id }
    });
    if (studentsResp.status === 404) error(404);
    const students = await studentsResp.json();

    return { students };
};
