import api from "$lib/api";
import { error } from "@sveltejs/kit";
import type { LayoutLoad } from "./$types";
import { User } from "itam-edu-common";
import type { Course } from "$lib/types";

export const load: LayoutLoad = async ({ fetch, depends }) => {
    depends("app:user", "app:courses");

    const [user, courses] = await Promise.all([
        getUser(fetch),
        getCourses(fetch)
    ]);

    return {
        user,
        courses
    };
};

async function getUser(fetch: typeof window.fetch): Promise<User | null> {
    const response = await api({ fetch }).users.me.get();
    if (response.error) {
        if (response.error.status === 401) return null;
        error(response.status);
    }
    const { user } = response.data;
    return new User(
        user.id,
        user.info,
        user.telegram,
        user.enrollments,
        user.permissions
    );
}

async function getCourses(fetch: typeof window.fetch): Promise<Course[]> {
    const response = await api({ fetch }).courses.get();
    if (response.error) error(response.status);
    return response.data;
}
