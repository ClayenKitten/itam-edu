import api from "$lib/api";
import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import type { Invite } from "$lib/types";

export const load: PageLoad = async ({ fetch, depends, parent }) => {
    depends("app:staff", "app:invites");
    const { course, user } = await parent();

    if (!user || !user.isCourseStaff(course.id)) {
        error(404);
    }

    const staff = await getStaff(fetch, course.id);
    let invites: Invite[] | null = null;
    if (course.permissions.staff.manage === true) {
        invites = await getInvites(fetch, course.id);
    }

    return { user, staff, invites, title: `Настройки | ${course.title}` };
};

async function getStaff(fetch: typeof window.fetch, courseId: string) {
    const response = await api({ fetch })
        .courses({ course: courseId })
        .staff.get();
    if (response.error) error(response.status);
    return response.data;
}
async function getInvites(fetch: typeof window.fetch, courseId: string) {
    const response = await api({ fetch })
        .courses({ course: courseId })
        .invites.get();
    if (response.error) error(response.status);
    return response.data;
}
