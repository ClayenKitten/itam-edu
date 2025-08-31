import api from "$lib/api";
import { error } from "@sveltejs/kit";
import type { LayoutLoad } from "./$types";
import type { Course, SubmissionPartial } from "$lib/types";
import type { User } from "itam-edu-common";

export const load: LayoutLoad = async ({ fetch, depends, parent }) => {
    depends("app:homeworks", "app:submissions");
    const { course, user } = await parent();

    let submissions = user ? await getSubmissions(fetch, course, user) : [];

    return { submissions, title: `Задания | ${course.title}` };
};

async function getSubmissions(
    fetch: typeof window.fetch,
    course: Course,
    user: User
): Promise<SubmissionPartial[]> {
    let filter: string | undefined;
    if (!course.permissions.submissions.view) {
        filter = user.id;
    }

    const response = await api({ fetch })
        .courses({ course: course.id })
        .submissions.get({ query: { student: filter } });
    if (response.error) {
        if (response.error.status === 401) {
            return [];
        }
        error(response.status);
    }
    return response.data;
}
