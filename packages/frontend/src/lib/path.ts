import { error } from "@sveltejs/kit";
import api from "./api";

export function coursePath({
    year,
    semester,
    slug
}: {
    year: number;
    semester: number | null;
    slug: string;
}) {
    return `/c/${year}${semester ? "/" + semester : ""}/${slug}`;
}

export async function lookupCourseId(
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
