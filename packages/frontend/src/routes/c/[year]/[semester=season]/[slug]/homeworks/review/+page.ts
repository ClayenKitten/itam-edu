import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import { coursePath } from "$lib/path";
import api from "$lib/api";

export const load: PageLoad = async ({ parent, url, fetch }) => {
    const { course, submissions } = await parent();

    if (!course.permissions.submissions.view) {
        error(403);
    }

    const students = await getStudents(fetch, course.id);

    const filteredSubmissions = submissions.filter(submission => {
        const homeworkId = url.searchParams.get("homework");
        const studentId = url.searchParams.get("student");
        if (homeworkId && homeworkId !== submission.homework.id) {
            return false;
        }
        if (studentId && studentId !== submission.student.id) {
            return false;
        }
        return true;
    });

    if (filteredSubmissions.length > 0) {
        const submission = filteredSubmissions[0]!;
        redirect(
            307,
            `${coursePath(course)}/homeworks/${submission.homework.id}/review/${submission.student.id}` +
                url.search
        );
    }

    return { title: `Проверка работ | ${course.title}`, students };
};

async function getStudents(fetch: typeof window.fetch, courseId: string) {
    const response = await api({ fetch })
        .courses({ course: courseId })
        .students.get();
    if (response.error) error(response.status);
    return response.data;
}
