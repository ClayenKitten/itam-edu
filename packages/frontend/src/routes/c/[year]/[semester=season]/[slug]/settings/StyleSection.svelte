<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import api, { UploadClient } from "$lib/api";
    import ImageUploader from "$lib/components/upload/ImageUploader.svelte";
    import { getColors, themes, type Theme } from "$lib/metadata";
    import { filePath } from "$lib/path";
    import { getToaster } from "$lib/Toaster.svelte";
    import type { Course } from "$lib/types";

    import { getContext } from "svelte";

    let { readonly, course }: Props = $props();
    type Props = {
        readonly: boolean;
        course: Course;
    };
    const toaster = getToaster();

    const courseClone = $state(structuredClone($state.snapshot(course)));
    const themeOverride = getContext<{ theme: Theme | null }>("themeOverride");
    $effect(() => {
        themeOverride.theme = courseClone.theme as Theme;
    });

    let uploadCover: File | null | undefined = $state();
    let uploadIcon: File | null | undefined = $state();
    let uploadBanner: File | null | undefined = $state();

    async function save() {
        const fileClient = new UploadClient({ fetch });

        const [cover, icon, banner] = await Promise.all([
            uploadCover !== undefined
                ? uploadCover === null
                    ? null
                    : fileClient.uploadCourseFile(
                          course.id,
                          "cover",
                          uploadCover
                      )
                : courseClone.cover,
            uploadIcon !== undefined
                ? uploadIcon === null
                    ? null
                    : fileClient.uploadCourseFile(course.id, "icon", uploadIcon)
                : courseClone.icon,
            uploadBanner !== undefined
                ? uploadBanner === null
                    ? null
                    : fileClient.uploadCourseFile(
                          course.id,
                          "banner",
                          uploadBanner
                      )
                : courseClone.banner
        ]);

        const result = await api({ fetch })
            .courses({ course: courseClone.id })
            .patch({ theme: courseClone.theme, cover, icon, banner });
        if (result.error) {
            toaster.add("Не удалось сохранить изменения", "error");
            return;
        }
        await invalidateAll();
        toaster.add("Изменения сохранены");
    }
</script>

<section class="flex flex-col gap-6 p-7.5 rounded-xl bg-surface shadow">
    <header>
        <h3>Стилизация</h3>
    </header>
    <div class="flex-1 min-w-max flex flex-col gap-2">
        <h4>Цветовая палитра</h4>
        <ul
            class={[
                "grid grid-cols-[repeat(auto-fit,60px)] auto-rows-[60px]",
                "gap-2 content-center items-center"
            ]}
        >
            {#each themes as theme (theme)}
                {@const colors = getColors(theme)}
                <button
                    class={[
                        "self-center justify-self-center",
                        "flex justify-center items-center",
                        "transition-all duration-200",
                        "size-12 border rounded-full",
                        "bg-conic from-primary to-on-primary from-50% to-50%",
                        "border-primary-border opacity-60",
                        !readonly && "hover:opacity-100 cursor-pointer",
                        theme === courseClone.theme &&
                            "border-primary opacity-100 size-15"
                    ]}
                    style:--color-primary={colors.primary}
                    style:--color-primary-border={colors.primaryBorder}
                    style:--color-on-primary={colors.onPrimary}
                    onclick={() => (courseClone.theme = theme)}
                    disabled={readonly}
                    aria-label={`Тема "${theme}"`}
                >
                </button>
            {/each}
        </ul>
    </div>
    <div class="flex flex-wrap gap-y-6 gap-x-12">
        <div class="w-max flex flex-col items-start gap-2">
            <header>
                <h4>Обложка</h4>
                <p
                    class="w-[400px] text-md-regular text-on-surface-muted text-balance"
                >
                    Обложка отображается в списке курсов, в предпросмотре ссылок
                    в Telegram и так далее. Рекомендуется изображение размером
                    от 315x315.
                </p>
            </header>
            <ImageUploader
                url={courseClone.cover ? filePath(courseClone.cover) : null}
                onChange={file => {
                    uploadCover = file;
                }}
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
                    браузере. Рекомендуется изображение размером 128x128.
                </p>
            </header>
            <ImageUploader
                url={courseClone.icon ? filePath(courseClone.icon) : null}
                onChange={file => {
                    uploadIcon = file;
                }}
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
                Рекомендуется изображение размером не менее 1600x320.
            </p>
        </header>
        <ImageUploader
            url={courseClone.banner ? filePath(courseClone.banner) : null}
            onChange={file => {
                uploadBanner = file;
            }}
            aspectRatio="5/1"
            {readonly}
        />
    </div>
    {#if !readonly}
        <footer class="flex justify-end gap-4">
            <button class="btn w-max" onclick={save}>Сохранить</button>
        </footer>
    {/if}
</section>
