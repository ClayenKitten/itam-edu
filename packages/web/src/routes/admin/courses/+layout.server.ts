import api from "$lib/api";
import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ fetch, depends }) => {
    depends("app:courses");
    const courses = await getCourses(fetch);
    return { courses };
};

async function getCourses(fetch: typeof window.fetch) {
    const coursesResp = await api({ fetch }).courses.get();
    if (coursesResp.error) error(coursesResp.status);
    return coursesResp.data;
}
