import type { PageLoad } from "./$types";
import api from "$lib/api";
import { error } from "@sveltejs/kit";

export const load: PageLoad = async ({ fetch, depends, parent }) => {
    depends("app:calls");
    const { course } = await parent();

    if (!course.permissions.calls.list) {
        error(403);
    }

    const calls = await getCalls(fetch, course.id);

    return { calls };
};

async function getCalls(fetch: typeof window.fetch, courseId: string) {
    const response = await api({ fetch })
        .courses({ course: courseId })
        .calls.get();
    if (response.error) error(response.status);
    return response.data;
}
