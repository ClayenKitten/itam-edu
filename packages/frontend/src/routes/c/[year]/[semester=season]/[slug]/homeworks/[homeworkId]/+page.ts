import api from "$lib/api";
import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import type { Submission } from "$lib/types";

export const load: PageLoad = async ({ fetch, depends, parent, params }) => {
    depends("app:submission");

    const { homework, user, course } = await parent();

    let submission: Submission | null = null;
    if (user && user.isCourseStudent(course.id)) {
        submission = await getSubmission(
            fetch,
            course.id,
            params.homeworkId,
            user.id
        );
    }

    return { submission, title: `${homework.title} | ${course.title}` };
};

async function getSubmission(
    fetch: typeof window.fetch,
    courseId: string,
    homeworkId: string,
    studentId: string
): Promise<Submission | null> {
    const response = await api({ fetch })
        .courses({ course: courseId })
        .homeworks({ homework: homeworkId })
        .submissions({ student: studentId })
        .get();
    if (response.error) {
        if (response.status === 404) {
            return null;
        }
        error(response.status);
    }
    return response.data;
}
