import api from "$lib/api";
import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ fetch, params, depends }) => {
    depends("app:course");
    const course = await getCourse(fetch, params.course_id);
    return { course };
};

async function getCourse(fetch: typeof window.fetch, course: string) {
    const courseResp = await api({ fetch }).courses({ course }).get();
    if (courseResp.error) error(courseResp.status);
    return courseResp.data;
}
