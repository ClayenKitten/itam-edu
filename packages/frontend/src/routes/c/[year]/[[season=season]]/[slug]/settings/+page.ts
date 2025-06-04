import api from "$lib/api";
import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch, depends, parent }) => {
    depends("app:staff");
    const { course, user } = await parent();

    if (!user || !user.isCourseStaff(course.id)) {
        error(404);
    }

    const staff = await getStaff(fetch, course.id);

    return { user, staff };
};

async function getStaff(fetch: typeof window.fetch, courseId: string) {
    const response = await api({ fetch })
        .courses({ course: courseId })
        .staff.get();
    if (response.error) error(response.status);
    return response.data;
}
