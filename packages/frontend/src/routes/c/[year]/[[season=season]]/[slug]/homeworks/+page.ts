import api from "$lib/api";
import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import type { AnyCnameRecord } from "dns";

export const load: PageLoad = async ({ fetch, depends, parent }) => {
    depends("app:homeworks", "app:submissions");
    const { course, user } = await parent();

    const homeworksPromise = getHomeworks(fetch, course.id);
    let submissionsPromise = user
        ? getSubmissions(fetch, course.id, user?.id)
        : Promise.resolve([]);

    const [homeworks, submissions] = await Promise.all([
        homeworksPromise,
        submissionsPromise
    ]);

    const tags = homeworks.map(hw => ({
        homeworkId: hw.id,
        tag: getSubmissionTags(submissions.map(submission => ({
            homework: submission.homework,
            review: { accepted: submission.review?.accepted}
        })), hw.id) as "accepted" | "new" | "submitted" | "rejected"
    }));

    return { homeworks, submissions, tags };
};

async function getHomeworks(fetch: typeof window.fetch, courseId: string) {
    const response = await api({ fetch })
        .courses({ course: courseId })
        .homeworks.get();
    if (response.error) error(response.status);
    return response.data;
}

async function getSubmissions(
    fetch: typeof window.fetch,
    courseId: string,
    user: string
) {
    const response = await api({ fetch })
        .courses({ course: courseId })
        .submissions.get({ query: { student: user } });
    if (response.error) error(response.status);
    return response.data;
}

function getSubmissionTags(
    submissions: { homework: string; review: {accepted: boolean|undefined}; }[], homeworkId: string
) {
    const homeworkSubmissions = submissions.filter((submission) => (submission.homework === homeworkId));

    if (homeworkSubmissions.length === 0) return "new";

    const latestSubmission = homeworkSubmissions[homeworkSubmissions.length-1];

    console.log(latestSubmission);

    if (latestSubmission.review.accepted === undefined) return "submitted";

    return latestSubmission.review.accepted ? "accepted" : "rejected";
}
