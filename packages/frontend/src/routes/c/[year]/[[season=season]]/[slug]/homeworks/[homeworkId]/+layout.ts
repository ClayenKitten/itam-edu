import api from "$lib/api";
import { error } from "@sveltejs/kit";
import type { LayoutLoad } from "./$types";
import type { Submission } from "$lib/types";

export const load: LayoutLoad = async ({
    fetch,
    depends,
    parent,
    params,
    url
}) => {
    depends("app:homework", "app:submission");

    const { user, course } = await parent();

    const homework = await getHomework(fetch, course.id, params.homeworkId);

    let studentId: string | null = null;
    if (user && user.isCourseStaff(course.id)) {
        studentId = url.searchParams.get("student");
    } else if (user && user.isCourseStudent(course.id)) {
        studentId = user.id;
    }
    if (!studentId) {
        return { homework, submission: null, studentId: null };
    }

    let submission = await getSubmission(
        fetch,
        course.id,
        params.homeworkId,
        studentId
    );

    return { homework, submission };
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
    if (typeof response.data.deadline === "string") {
        response.data.deadline = new Date(response.data.deadline);
    }
    return response.data;
}

async function getSubmission(
    fetch: typeof window.fetch,
    courseId: string,
    homeworkId: string,
    studentId: string
): Promise<Submission> {
    const response = await api({ fetch })
        .courses({ course: courseId })
        .submissions({ homework: homeworkId })({ student: studentId })
        .get();
    if (response.error) {
        error(response.status);
    }
    return response.data;
}
