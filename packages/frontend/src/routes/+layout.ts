import api from "$lib/api";
import { error } from "@sveltejs/kit";
import type { LayoutLoad } from "./$types";
import { User, type CalendarEvent } from "itam-edu-common";
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

    depends("app:user", "app:courses", "app:notifications", "app:calendar");

    const coursePromise = getCourses(fetch);
    if (data.sessionToken) {
        const [user, courses, notifications] = await Promise.all([
            getUser(fetch),
            coursePromise,
            getNotifications(fetch)
        ]);
        return {
            user,
            courses,
            notifications,
            ...metadata
        };
    } else {
        const courses = await coursePromise;
        return {
            user: null,
            courses,
            notifications: [],
            ...metadata
        };
    }
};

async function getUser(fetch: typeof window.fetch): Promise<User> {
    const response = await api({ fetch }).users.me.get();
    if (response.error) {
        error(response.status);
    }
    const { user } = response.data;
    return new User(user.id, user.info, user.telegram, user.courses);
}

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
