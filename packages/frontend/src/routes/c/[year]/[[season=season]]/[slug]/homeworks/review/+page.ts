import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import { coursePath } from "$lib/path";

export const load: PageLoad = async ({ parent, url }) => {
    const { course, submissions } = await parent();

    if (!course.permissions.submissions.view) {
        error(404);
    }

    if (submissions.length > 0) {
        const submission = submissions[0]!;
        redirect(
            307,
            `${coursePath(course)}/homeworks/${submission.homework.id}/review/${submission.student.id}` +
                url.search
        );
    }
};
