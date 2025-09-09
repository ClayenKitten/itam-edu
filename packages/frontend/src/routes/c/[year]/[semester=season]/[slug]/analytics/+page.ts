import type { PageLoad } from "./$types";
import api from "$lib/api";
import { error } from "@sveltejs/kit";

export const load: PageLoad = async ({ fetch, depends, parent }) => {
    depends(
        "app:students",
        "app:staff",
        "app:submissions",
        "app:attendees",
        "app:statistics"
    );
    const { course } = await parent();

    if (course.permissions.analytics.view !== true) {
        error(403);
    }

    const [students, staff, submissions, attendees, statistics] =
        await Promise.all([
            getStudents(fetch, course.id),
            getStaff(fetch, course.id),
            getSubmissions(fetch, course.id),
            getAttendees(fetch, course.id),
            getStatistics(fetch, course.id)
        ]);
    return {
        students,
        staff,
        submissions,
        attendees,
        statistics,
        title: `Аналитика | ${course.title}`
    };
};

async function getStudents(fetch: typeof window.fetch, courseId: string) {
    const response = await api({ fetch })
        .courses({ course: courseId })
        .students.get();
    if (response.error) error(response.status);
    return response.data;
}

async function getStaff(fetch: typeof window.fetch, courseId: string) {
    const response = await api({ fetch })
        .courses({ course: courseId })
        .staff.get();
    if (response.error) error(response.status);
    return response.data;
}

async function getSubmissions(fetch: typeof window.fetch, courseId: string) {
    const response = await api({ fetch })
        .courses({ course: courseId })
        .submissions.get({ query: {} });
    if (response.error) error(response.status);
    return response.data;
}

async function getAttendees(fetch: typeof window.fetch, courseId: string) {
    const response = await api({ fetch })
        .courses({ course: courseId })
        .lessons.attendees.get();
    if (response.error) error(response.status);
    return response.data;
}

async function getStatistics(fetch: typeof window.fetch, courseId: string) {
    const response = await api({ fetch })
        .courses({ course: courseId })
        .statistics.get();
    if (response.error) error(response.status);
    return response.data;
}
