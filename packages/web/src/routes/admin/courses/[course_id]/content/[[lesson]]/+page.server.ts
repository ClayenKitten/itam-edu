import api from "$lib/api";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, params, depends }) => {
    depends("app:lesson", "app:lessons");

    const [lessonsResp, lessonResp] = await Promise.all([
        api({ fetch }).courses[":course"].lessons.$get({
            param: { course: params.course_id }
        }),
        params.lesson
            ? api({ fetch }).courses[":course"].lessons[":lesson"].$get({
                  param: { course: params.course_id, lesson: params.lesson }
              })
            : null
    ]);
    if (lessonsResp.status === 404 || lessonResp?.status === 404) error(404);
    const [lessons, lesson] = await Promise.all([
        lessonsResp.json(),
        lessonResp?.json() ?? null
    ]);

    return { lessons, lesson };
};
