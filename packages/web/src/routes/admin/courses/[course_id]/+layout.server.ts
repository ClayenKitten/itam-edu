import api from "$lib/api";
import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ fetch, params, depends }) => {
    depends("app:course");

    const courseResp = await api({ fetch }).courses[":course"].$get({
        param: { course: params.course_id }
    });
    if (courseResp.status === 404) error(404);
    const course = await courseResp.json();

    return { course };
};
