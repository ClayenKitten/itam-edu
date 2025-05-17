import api from "$lib/api";
import { error } from "@sveltejs/kit";
import type { LayoutLoad } from "./$types";
import { lookupCourseId } from "$lib/path";

export const load: LayoutLoad = async ({ fetch, params, depends }) => {
    depends("app:course", "app:lessons", "app:homeworks");

    const courseId = await lookupCourseId(fetch, params);
    const course = await getCourse(fetch, courseId);

    return { course, lessons: course.lessons, homeworks: course.homeworks };
};

async function getCourse(fetch: typeof window.fetch, courseId: string) {
    const response = await api({ fetch }).courses({ course: courseId }).get();
    if (response.error) error(response.status);
    return response.data;
}
