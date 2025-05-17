import api from "$lib/api";
import { error } from "@sveltejs/kit";
import type { LayoutLoad } from "./$types";
import type { SubmissionPartial } from "$lib/types";

export const load: LayoutLoad = async ({ fetch, depends, parent }) => {
    depends("app:homeworks", "app:submissions");
    const { course, user } = await parent();

    let submissions = user ? await getSubmissions(fetch, course.id) : [];

    return { submissions };
};

async function getSubmissions(
    fetch: typeof window.fetch,
    courseId: string
): Promise<SubmissionPartial[]> {
    const response = await api({ fetch })
        .courses({ course: courseId })
        .submissions.get({ query: {} });
    if (response.error) {
        if (response.error.status === 401) {
            return [];
        }
        error(response.status);
    }
    return response.data;
}
