import api from "$lib/api";
import { error } from "@sveltejs/kit";
import type { LayoutLoad } from "./$types";
import type { CoursePartial } from "$lib/types";
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

    depends("app:courses");

    const courses = await getCourses(fetch);

    return {
        user: data.user,
        courses,
        ...metadata
    };
};

async function getCourses(
    fetch: typeof window.fetch
): Promise<CoursePartial[]> {
    const response = await api({ fetch }).courses.get();
    if (response.error) {
        error(response.status, "Не удалось загрузить список курсов");
    }
    return response.data;
}
