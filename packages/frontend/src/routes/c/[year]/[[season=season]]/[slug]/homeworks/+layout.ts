import api from "$lib/api";
import { error } from "@sveltejs/kit";
import type { LayoutLoad } from "./$types";
import type { SubmissionPartial } from "$lib/types";

export const load: LayoutLoad = async ({ fetch, depends, parent }) => {
    depends("app:homeworks", "app:submissions");
    const { course, user } = await parent();

    const homeworksPromise = getHomeworks(fetch, course.id);
    let submissionsPromise = user
        ? getSubmissions(fetch, course.id)
        : Promise.resolve([]);

    const [homeworks, submissions] = await Promise.all([
        homeworksPromise,
        submissionsPromise
    ]);

    return { homeworks, submissions };
};

async function getHomeworks(fetch: typeof window.fetch, courseId: string) {
    const response = await api({ fetch })
        .courses({ course: courseId })
        .homeworks.get();
    if (response.error) error(response.status);
    return response.data;
}

async function getSubmissions(
    fetch: typeof window.fetch,
    courseId: string
): Promise<SubmissionPartial[] | null> {
    const response = await api({ fetch })
        .courses({ course: courseId })
        .submissions.get({ query: {} });
    if (response.error) {
        if (response.error.status === 401) {
            return null;
        }
        error(response.status);
    }
    return response.data;
}
