import api from "$lib/api";
import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import type { Attendee, Student } from "$lib/types";

export const load: PageLoad = async ({ fetch, depends, parent, params }) => {
    depends("app:attendees", "app:students", "app:staff");

    const { course, lesson } = await parent();

    if (course.permissions.attendance.view !== true) {
        error(404);
    }

    const [attendees, students, staff] = await Promise.all([
        getAttendees(fetch, course.id, params.lessonId),
        getStudents(fetch, course.id),
        getStaff(fetch, course.id)
    ]);

    return {
        attendees,
        students,
        staff,
        title: `Посещаемость | ${lesson.title} | ${course.title}`
    };
};

async function getAttendees(
    fetch: typeof window.fetch,
    courseId: string,
    lessonId: string
): Promise<Attendee[]> {
    const response = await api({ fetch })
        .courses({ course: courseId })
        .lessons({ lesson: lessonId })
        .attendees.get();
    if (response.error) {
        error(response.status);
    }
    return response.data;
}

async function getStaff(fetch: typeof window.fetch, courseId: string) {
    const response = await api({ fetch })
        .courses({ course: courseId })
        .staff.get();
    if (response.error) error(response.status);
    return response.data;
}

async function getStudents(
    fetch: typeof window.fetch,
    courseId: string
): Promise<Student[]> {
    const response = await api({ fetch })
        .courses({ course: courseId })
        .students.get();
    if (response.error) {
        error(response.status);
    }
    return response.data;
}
