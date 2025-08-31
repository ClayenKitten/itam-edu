import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ parent }) => {
    const { course } = await parent();

    return { title: `Новое задание | ${course.title}` };
};
