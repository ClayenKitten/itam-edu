import api from "$lib/api";
import { error } from "@sveltejs/kit";
import type { LayoutLoad } from "./$types";
import { User, type CalendarEvent } from "itam-edu-common";
import type { Course, CoursePartial } from "$lib/types";

export const load: LayoutLoad = async ({ fetch, depends }) => {
    depends("app:user", "app:courses", "app:calendar");

    const [user, courses, calendar] = await Promise.all([
        getUser(fetch),
        getCourses(fetch),
        getCalendar(fetch)
    ]);

    return {
        user,
        courses,
        calendar
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

async function getCourses(
    fetch: typeof window.fetch
): Promise<CoursePartial[]> {
    const response = await api({ fetch }).courses.get();
    if (response.error) error(response.status);
    return response.data;
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
