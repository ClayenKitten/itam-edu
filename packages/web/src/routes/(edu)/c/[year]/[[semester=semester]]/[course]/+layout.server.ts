import api from "$lib/api";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ fetch, parent }) => {
    const { course } = await parent();

    const lessonsResp = await api({ fetch }).courses[":course"].lessons.$get({
        param: {
            course: course!.id
        }
    });
    const lessons = await lessonsResp.json();
    return { course: course!, lessons };
};
