import api from "$lib/api";
import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch, depends, parent }) => {
    depends("app:homeworks");
    const { course, user } = await parent();

    const homeworksPromise = getHomeworks(fetch, course.id);
    let submissionsPromise = user
        ? getSubmissions(fetch, course.id, user?.id)
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
    courseId: string,
    user: string
) {
    const response = await api({ fetch })
        .courses({ course: courseId })
        .submissions.get({ query: { student: user } });
    if (response.error) error(response.status);
    return response.data;
}
