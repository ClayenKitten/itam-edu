import type { PageLoad } from "./$types";
import api from "$lib/api";
import { error } from "@sveltejs/kit";

export const load: PageLoad = async ({ fetch, params, depends, parent }) => {
    depends("app:courseSummary", "app:lessons");

    const { course, user } = await parent();

    const [lessons, updates] = await Promise.all([
        getLessons(fetch, course.id),
        user ? getUpdates(fetch, course.id, user.id) : Promise.resolve([])
    ]);

    return {
        lessons,
        updates
    };
};

async function getLessons(fetch: typeof window.fetch, courseId: string) {
    const response = await api({ fetch })
        .courses({ course: courseId })
        .lessons.get();
    if (response.error) error(response.status);
    return response.data;
}

// TODO: get course updates from backend
async function getUpdates(
    fetch: typeof window.fetch,
    courseId: string,
    userId: string
) {
    return [
        {
            id: crypto.randomUUID(),
            title: "Look at that cat!",
            detail: "It's really cute",
            date: new Date(),
            avatarSrc: "https://100k-faces.glitch.me/random-image?a=1",
            href: "https://www.reddit.com/r/cats/comments/1j46hph/this_is_olive_olive_is_not_a_cuddling_cat_but/",
            unread: true
        },
        {
            id: crypto.randomUUID(),
            title: "Look at that cat!",
            detail: "It's really cute",
            date: new Date(),
            avatarSrc: "https://100k-faces.glitch.me/random-image?a=2",
            href: "https://www.reddit.com/r/cats/comments/1j46hph/this_is_olive_olive_is_not_a_cuddling_cat_but/",
            unread: true
        },
        {
            id: crypto.randomUUID(),
            title: "Look at that cat!",
            detail: "It's really cute",
            date: new Date(),
            avatarSrc: "https://100k-faces.glitch.me/random-image?a=3",
            href: "https://www.reddit.com/r/cats/comments/1j46hph/this_is_olive_olive_is_not_a_cuddling_cat_but/",
            unread: false
        },
        {
            id: crypto.randomUUID(),
            title: "Look at that cat!",
            detail: "It's really cute",
            date: new Date(),
            avatarSrc: "https://100k-faces.glitch.me/random-image?a=4",
            href: "https://www.reddit.com/r/cats/comments/1j46hph/this_is_olive_olive_is_not_a_cuddling_cat_but/",
            unread: false
        },
        {
            id: crypto.randomUUID(),
            title: "Look at that cat!",
            detail: "It's really cute",
            date: new Date(),
            avatarSrc: "https://100k-faces.glitch.me/random-image?a=5",
            href: "https://www.reddit.com/r/cats/comments/1j46hph/this_is_olive_olive_is_not_a_cuddling_cat_but/",
            unread: false
        },
        {
            id: crypto.randomUUID(),
            title: "Look at that cat!",
            detail: "It's really cute",
            date: new Date(),
            avatarSrc: "https://100k-faces.glitch.me/random-image?a=6",
            href: "https://www.reddit.com/r/cats/comments/1j46hph/this_is_olive_olive_is_not_a_cuddling_cat_but/",
            unread: false
        }
    ];
}
