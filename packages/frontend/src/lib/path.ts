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
