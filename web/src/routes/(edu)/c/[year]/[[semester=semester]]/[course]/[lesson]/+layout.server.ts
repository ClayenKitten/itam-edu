import api from "$lib/api";
import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ fetch, params, parent }) => {
    const { course } = await parent();

    let lesson = undefined;
    if (params.year && params.course) {
        // Lookup lesson id
        const lessonIdResp = await api({ fetch }).courses[
            ":course"
        ].lessons.lookup[":lessonSlug"].$get({
            param: { course: course.id, lessonSlug: params.lesson }
        });
        if (lessonIdResp.status === 404) error(404);
        const { id: lessonId } = await lessonIdResp.json();

        // Get lesson
        const lessonResp = await api({ fetch }).courses[":course"].lessons[
            ":lesson"
        ].$get({
            param: { course: course.id, lesson: lessonId }
        });
        if (lessonResp.status === 404) error(404);
        lesson = await lessonResp.json();
    }

    return { lesson };
};
