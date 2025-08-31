import api from "$lib/api";
import { error } from "@sveltejs/kit";
import type { LayoutLoad } from "./$types";
import { User, type CalendarEvent } from "itam-edu-common";
import type { CoursePartial, Notification } from "$lib/types";
import type { Metadata } from "$lib/metadata";

export const load: LayoutLoad = async ({ fetch, depends }) => {
    depends("app:user", "app:courses", "app:notifications", "app:calendar");

    const [user, courses, notifications, calendar] = await Promise.all([
        getUser(fetch),
        getCourses(fetch),
        getNotifications(fetch),
        getCalendar(fetch)
    ]);

    return {
        user,
        courses,
        notifications,
        calendar,
        // Page metadata
        ...({
            title: "ITAM Education",
            description:
                "Образовательная платформа студенческого объединения IT at MISIS (ITAM).",
            favicon: "/favicon.png",
            theme: "default",
            pageImage: null
        } satisfies Metadata)
    };
};

async function getUser(fetch: typeof window.fetch): Promise<User | null> {
    const response = await api({ fetch }).users.me.get();
    if (response.error) {
        if (response.error.status === 401) return null;
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
        if (response.status === 401) return [];
        error(response.status);
    }
    return response.data.notifications;
}

async function getCalendar(
    fetch: typeof window.fetch
): Promise<CalendarEvent[]> {
    const response = await api({ fetch }).users.me.calendar.get({
        query: { after: new Date().toISOString() }
    });
    if (response.error) {
        if (response.status === 401) return [];
        error(response.status);
    }
    return response.data.map(e => ({ ...e, datetime: new Date(e.datetime) }));
}
