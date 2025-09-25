<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import api, { UploadClient } from "$lib/api";
    import ImageUploader from "$lib/components/upload/ImageUploader.svelte";
    import { filePath } from "$lib/path";
    import { getToaster } from "$lib/Toaster.svelte";
    import type { Course, UpdateCourse } from "$lib/types";

    let { readonly, course }: Props = $props();
    type Props = {
        readonly: boolean;
        course: Course;
    };
    const toaster = getToaster();

    async function save(field: "cover" | "icon" | "banner", file: File | null) {
        try {
            let update: Partial<UpdateCourse> = {};
            if (file !== null) {
                const fileClient = new UploadClient({ fetch });
                const filename = await fileClient.uploadCourseFile(
                    course.id,
                    field,
                    file
                );
                update[field] = filename;
            } else {
                update[field] = null;
            }
            const result = await api({ fetch })
                .courses({ course: course.id })
                .patch(update);
            if (result.error) {
                toaster.add("Не удалось сохранить файл", "error");
                return;
            }
            toaster.add(
                "Файл сохранён, обновите страницу, чтобы увидеть изменения"
            );
        } catch {
            toaster.add("Не удалось сохранить файл", "error");
            return;
        }
        await invalidateAll();
    }
</script>

<section class="flex flex-col gap-6 p-7.5 rounded-xl bg-surface shadow">
    <header>
        <h3>Стилизация</h3>
    </header>
    <div class="flex flex-wrap gap-y-6 gap-x-12">
        <div class="w-max flex flex-col items-start gap-2">
            <header>
                <h4>Обложка</h4>
                <p
                    class="w-[400px] text-md-regular text-on-surface-muted text-balance"
                >
                    Обложка отображается в списке курсов, в предпросмотре ссылок
                    в Telegram и тд. Рекомендуется изображение размером 315x315
                    пикселей.
                </p>
            </header>
            <ImageUploader
                url={course.cover ? filePath(course.cover) : null}
                onChange={file => save("cover", file)}
                height="315px"
                aspectRatio="315/315"
                {readonly}
            />
        </div>
        <div class="w-max flex flex-col items-start gap-2">
            <header>
                <h4>Иконка</h4>
                <p
                    class="w-[400px] text-md-regular text-on-surface-muted text-balance"
                >
                    Иконка отображается в селекторе курсов и около вкладки в
                    браузере. Рекомендуется круглое изображение размером 128x128
                    пикселей.
                </p>
            </header>
            <ImageUploader
                url={course.icon ? filePath(course.icon) : null}
                onChange={file => save("icon", file)}
                height="128px"
                aspectRatio="1/1"
                {readonly}
            />
        </div>
    </div>
    <div class="shrink-0 flex flex-col gap-2">
        <header>
            <h4>Баннер</h4>
            <p class="max-w-[600px] text-md-regular text-on-surface-muted">
                Баннер отображается на главной странице курса и в разделе "О
                курсе". <br />
                Рекомендуется изображение размером 1600x320 пикселей.
            </p>
        </header>
        <ImageUploader
            url={course.banner ? filePath(course.banner) : null}
            onChange={file => save("banner", file)}
            aspectRatio="5/1"
            {readonly}
        />
    </div>
</section>
