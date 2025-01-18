import api from "$lib/api";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, params, depends }) => {
    depends("app:lesson", "app:lessons");
    const [lessons, lesson] = await Promise.all([
        getLessons(fetch, params.course_id),
        params.lesson ? getLesson(fetch, params.course_id, params.lesson) : null
    ]);
    return { lessons, lesson };
};

async function getLessons(fetch: typeof window.fetch, course: string) {
    const lessonsResp = await api({ fetch }).courses({ course }).lessons.get();
    if (lessonsResp.error) error(lessonsResp.status);
    return lessonsResp.data;
}

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
