import { lookupCourseId } from "$lib/path";
import type { PageLoad } from "./$types";
import api from "$lib/api";

export const load: PageLoad = async ({ fetch, params, depends }) => {
    depends("app:courseSummary");

    const courseId = await lookupCourseId(fetch, params);

    return {
        // TODO: course summary generation on backend
        courseSummary: {
            lessons:
                (
                    await api({ fetch })
                        .courses({ course: courseId })
                        .lessons.get()
                ).data ?? [],
            updates: [
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
            ]
        }
    };
};
