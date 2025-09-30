import type { PageLoad } from "./$types";
import api from "$lib/api";
import { error } from "@sveltejs/kit";

export const load: PageLoad = async ({ fetch, depends, parent }) => {
    depends("app:changes");
    const { course } = await parent();

    const changes = await getChanges(fetch, course.id);

    return { changes };
};

async function getChanges(fetch: typeof window.fetch, courseId: string) {
    const response = await api({ fetch })
        .courses({ course: courseId })
        .changes.get();
    if (response.error) error(response.status);
    return response.data;
}
