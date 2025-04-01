import api from "$lib/api";
import { error } from "@sveltejs/kit";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async ({ fetch, depends }) => {
    depends("app:user", "app:permissions", "app:enrollments", "app:courses");

    const [userResp, coursesResp] = await Promise.all([
        api({ fetch }).users.me.get(),
        api({ fetch }).courses.get()
    ]);

    if (coursesResp.error) error(coursesResp.status);
    const courses = coursesResp.data;

    if (userResp.error) return { user: null, permissions: null, courses };
    const { user, permissions, enrollments } = userResp.data;

    return { user, permissions, enrollments, courses };
};
