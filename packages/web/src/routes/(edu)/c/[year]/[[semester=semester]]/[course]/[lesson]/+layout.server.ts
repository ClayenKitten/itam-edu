import api from "$lib/api";
import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({
    fetch,
    params,
    parent,
    depends
}) => {
    depends("app:lesson");
    const { course } = await parent();
    const lesson = await getLesson(fetch, course.id, params.lesson);
    return { lesson };
};

async function getLesson(
    fetch: typeof window.fetch,
    course: string,
    lesson: string
) {
    const lessonResp = await api({ fetch })
        .courses({ course })
        .lessons({ lesson })
        .get();
    if (lessonResp.error) error(lessonResp.status);
    return lessonResp.data;
}
