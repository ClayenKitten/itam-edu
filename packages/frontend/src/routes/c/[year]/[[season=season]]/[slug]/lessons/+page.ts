import api from "$lib/api";
import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch, depends, parent }) => {
    depends("app:lessons");

    const { course } = await parent();

    const lessons = await getLessons(fetch, course.id);

    return { lessons };
};

async function getLessons(fetch: typeof window.fetch, courseId: string) {
    const response = await api({ fetch })
        .courses({ course: courseId })
        .lessons.get();
    if (response.error) error(response.status);
    return response.data;
}
