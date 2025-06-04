import type { PageLoad } from "./$types";
import api from "$lib/api";
import { error } from "@sveltejs/kit";

export const load: PageLoad = async ({ fetch, depends, parent }) => {
    depends("app:students", "app:stats");
    const { course, user } = await parent();

    if (!user || !user.isCourseStaff(course.id)) {
        error(404);
    }

    const students = await getStudents(fetch, course.id);
    const stats = getStats(fetch, course.id);
    return { students, stats };
};

async function getStudents(fetch: typeof window.fetch, courseId: string) {
    const response = await api({ fetch })
        .courses({ course: courseId })
        .students.get();
    if (response.error) error(response.status);
    return response.data;
}

async function getStats(fetch: typeof window.fetch, courseId: string) {
    const response = await api({ fetch })
        .courses({ course: courseId })
        .statistics.get();
    if (response.error) error(response.status);
    return response.data;
}
