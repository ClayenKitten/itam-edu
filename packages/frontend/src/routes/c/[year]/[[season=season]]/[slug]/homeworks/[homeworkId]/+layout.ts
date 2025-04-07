import api from "$lib/api";
import { error } from "@sveltejs/kit";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async ({ fetch, depends, parent, params }) => {
    depends("app:homework");

    const { course } = await parent();

    const homework = await getHomework(fetch, course.id, params.homeworkId);

    return { homework };
};

async function getHomework(
    fetch: typeof window.fetch,
    courseId: string,
    homeworkId: string
) {
    const response = await api({ fetch })
        .courses({ course: courseId })
        .homeworks({ homework: homeworkId })
        .get();
    if (response.error) error(response.status);
    return response.data;
}
