import api from "$lib/api";
import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ fetch, params, parent }) => {
    const { course } = await parent();

    const lessonResp = await api({ fetch }).courses[":course"].lessons[
        ":lesson"
    ].$get({
        param: { course: course.id, lesson: params.lesson }
    });
    if (lessonResp.status === 404) error(404);
    let lesson = await lessonResp.json();

    return { lesson };
};
