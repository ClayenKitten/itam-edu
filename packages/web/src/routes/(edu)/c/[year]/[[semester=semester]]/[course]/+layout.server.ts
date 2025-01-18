import api from "$lib/api";
import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ fetch, parent, depends }) => {
    depends("app:lessons");
    const { course: maybeCourse } = await parent();
    const course = maybeCourse!;
    const lessons = await getLessons(fetch, course.id);
    return { course, lessons };
};

async function getLessons(fetch: typeof window.fetch, course: string) {
    const lessonsResp = await api({ fetch }).courses({ course }).lessons.get();
    if (lessonsResp.error) error(lessonsResp.status);
    return lessonsResp.data;
}
