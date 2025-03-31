import api from "$lib/api";
import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch, depends, parent, params }) => {
    depends("app:lesson");

    const { course } = await parent();

    const lesson = await getLesson(fetch, course.id, params.lessonId);

    return { lesson };
};

async function getLesson(
    fetch: typeof window.fetch,
    courseId: string,
    lessonId: string
) {
    const response = await api({ fetch })
        .courses({ course: courseId })
        .lessons({ lesson: lessonId })
        .get();
    if (response.error) error(response.status);
    return response.data;
}
