import api from "$lib/api";
import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import type { Submission } from "$lib/types";

export const load: PageLoad = async ({ fetch, depends, parent, params }) => {
    depends("app:submission");

    const { course } = await parent();

    if (course.permissions.submissions.view !== true) {
        error(403);
    }

    const [submission, students] = await Promise.all([
        getSubmission(fetch, course.id, params.homeworkId, params.student),
        getStudents(fetch, course.id)
    ]);

    return { title: `Проверка работ | ${course.title}`, submission, students };
};

async function getSubmission(
    fetch: typeof window.fetch,
    courseId: string,
    homeworkId: string,
    studentId: string
): Promise<Submission> {
    const response = await api({ fetch })
        .courses({ course: courseId })
        .homeworks({ homework: homeworkId })
        .submissions({ student: studentId })
        .get();
    if (response.error) {
        error(response.status);
    }
    return response.data;
}

async function getStudents(fetch: typeof window.fetch, courseId: string) {
    const response = await api({ fetch })
        .courses({ course: courseId })
        .students.get();
    if (response.error) error(response.status);
    return response.data;
}
