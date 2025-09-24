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
    if (!semester) {
        return `/c/${year}/${slug}`;
    }
    return `/c/${year}/${semester}/${slug}`;
}

export function filePath(file: string) {
    return `/files/${file}`;
}

export async function lookupCourseId(
    fetch: typeof window.fetch,
    params: { year: string; slug: string; semester: "autumn" | "spring" }
): Promise<string> {
    const query = {
        year: Number(params.year),
        semester: params.semester
    };

    const response = await api({ fetch })
        .courses.lookup({ slug: params.slug })
        .get({ query });
    if (response.error) error(response.status);
    return response.data.id;
}
