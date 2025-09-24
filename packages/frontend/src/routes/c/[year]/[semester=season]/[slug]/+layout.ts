import api from "$lib/api";
import { error } from "@sveltejs/kit";
import type { LayoutLoad } from "./$types";
import { filePath, lookupCourseId } from "$lib/path";
import type { Metadata, Theme } from "$lib/metadata";

export const load: LayoutLoad = async ({ fetch, params, depends }) => {
    depends("app:course", "app:lessons", "app:homeworks");

    const courseId = await lookupCourseId(fetch, params);
    const course = await getCourse(fetch, courseId);

    let metadata: Partial<Metadata> & Pick<Metadata, "title" | "theme"> = {
        title: course.title + " | ITAM Education",
        theme: course.theme as Theme
    };
    if (course.icon) {
        metadata.favicon = filePath(course.icon);
    }
    if (course.description) {
        metadata.description = course.description;
    }
    if (course.cover) {
        metadata.pageImage = {
            url: filePath(course.cover),
            width: 315,
            height: 315
        };
    }

    return {
        ...metadata,
        course,
        lessons: course.lessons,
        homeworks: course.homeworks
    };
};

async function getCourse(fetch: typeof window.fetch, courseId: string) {
    const response = await api({ fetch }).courses({ course: courseId }).get();
    if (response.error) error(response.status);
    return response.data;
}
