import { courseFilePath } from "itam-edu-common";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ parent }) => {
    const { course, lesson, description, pageImage } = await parent();

    return {
        title: `${lesson.title} | ${course.title}`,
        description: lesson.description || description,
        pageImage: lesson.banner
            ? {
                  url: courseFilePath(course.id).public(lesson.banner),
                  width: 996,
                  height: 600
              }
            : pageImage
    };
};
