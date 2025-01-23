import api from "$lib/api";
import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ fetch, params, depends }) => {
    depends("app:courses", "app:course");
    const { course: slug, year, semester } = params;
    const courses = await getCourses(fetch);
    if (!year || !slug) return { courses };

    // If path includes course parameters, get course object.
    // Currently it is needed to display course name in layout.
    const courseId = await lookupCourseId(fetch, {
        slug,
        year,
        semester
    });
    const course = await getCourseById(fetch, courseId);
    return { courses, course };
};

async function getCourses(fetch: typeof window.fetch): Promise<any> {
    const response = await api({ fetch }).courses.get();
    if (response.error) error(response.status);
    return response.data;
}

async function lookupCourseId(
    fetch: typeof window.fetch,
    params: { year: string; slug: string; semester?: string }
): Promise<string> {
    const query = {
        year: Number(params.year),
        semester: params.semester ? Number(params.semester) : undefined
    };
    if (query.semester === undefined) delete query.semester;

    const response = await api({ fetch })
        .courses.lookup({ slug: params.slug })
        .get({ query });
    if (response.error) error(response.status);
    return response.data.id;
}

async function getCourseById(fetch: typeof window.fetch, courseId: string) {
    const response = await api({ fetch }).courses({ course: courseId }).get();
    if (response.error) error(response.status);
    return response.data;
}
