import { filePath } from "$lib/path";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ parent }) => {
    const { course, lesson, description, pageImage } = await parent();

    return {
        title: `${lesson.title} | ${course.title}`,
        description: lesson.description || description,
        pageImage: lesson.banner
            ? {
                  url: filePath(lesson.banner),
                  width: 996,
                  height: 600
              }
            : pageImage
    };
};
