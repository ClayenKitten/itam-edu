import api from "$lib/api";
import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ fetch }) => {
    const coursesResp = await api({ fetch }).courses.$get();
    if (coursesResp.status === 404) error(404);
    const courses = await coursesResp.json();

    return { courses };
};
