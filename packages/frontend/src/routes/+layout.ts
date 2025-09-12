import api from "$lib/api";
import { error } from "@sveltejs/kit";
import type { LayoutLoad } from "./$types";
import type { CoursePartial, Notification } from "$lib/types";
import type { Metadata } from "$lib/metadata";

export const load: LayoutLoad = async ({ fetch, depends, data }) => {
    const metadata = {
        title: "ITAM Education",
        description:
            "Образовательная платформа студенческого объединения IT at MISIS (ITAM).",
        favicon: "/favicon.png",
        theme: "default",
        pageImage: null
    } satisfies Metadata;

    depends("app:courses", "app:notifications");

    const [courses, notifications] = await Promise.all([
        getCourses(fetch),
        data.user ? getNotifications(fetch) : Promise.resolve([])
    ]);

    return {
        config: data.config,
        user: data.user,
        courses,
        notifications,
        ...metadata
    };
};

async function getCourses(
    fetch: typeof window.fetch
): Promise<CoursePartial[]> {
    const response = await api({ fetch }).courses.get();
    if (response.error) error(response.status);
    return response.data;
}

async function getNotifications(
    fetch: typeof window.fetch
): Promise<Notification[]> {
    const response = await api({ fetch }).users.me.notifications.get();
    if (response.error) {
        error(response.status);
    }
    return response.data.notifications;
}
