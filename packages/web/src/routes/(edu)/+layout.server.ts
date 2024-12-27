import api from "$lib/api";
import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ fetch, params }) => {
    const coursesResp = await api({ fetch }).courses.$get();
    const courses = await coursesResp.json();

    let course = undefined;
    if (params.year && params.course) {
        const courseIdResp = await api({ fetch }).courses.lookup[":year"][
            ":semester"
        ][":courseSlug"].$get({
            param: {
                year: params.year,
                semester: params.semester ?? "null",
                courseSlug: params.course
            }
        });
        if (courseIdResp.status === 404) error(404);
        const { id: courseId } = await courseIdResp.json();

        const courseResp = await api({ fetch }).courses[":course"].$get({
            param: { course: courseId }
        });
        if (courseResp.status === 404) error(404);
        course = await courseResp.json();
    }

    return { courses, course };
};
