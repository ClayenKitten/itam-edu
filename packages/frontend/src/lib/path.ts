import { error } from "@sveltejs/kit";
import api from "./api";

export function coursePath({
    year,
    semester,
    slug
}: {
    year: number;
    semester: "autumn" | "spring" | null;
    slug: string;
}) {
    return `/c/${year}${semester ? "/" + semester : ""}/${slug}`;
}

export async function lookupCourseId(
    fetch: typeof window.fetch,
    params: { year: string; slug: string; semester?: "autumn" | "spring" }
): Promise<string> {
    const query = {
        year: Number(params.year),
        semester: params.semester
    };
    if (query.semester === undefined) delete query.semester;

    const response = await api({ fetch })
        .courses.lookup({ slug: params.slug })
        .get({ query });
    if (response.error) error(response.status);
    return response.data.id;
}
