import api from "$lib/api";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ fetch }) => {
    const coursesResp = await api({ fetch }).courses.$get();
    const courses = await coursesResp.json();

    return { courses };
};
