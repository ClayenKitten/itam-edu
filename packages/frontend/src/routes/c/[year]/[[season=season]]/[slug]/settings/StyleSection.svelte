<script lang="ts">
    import { invalidate } from "$app/navigation";
    import api from "$lib/api";
    import ImageUploader from "$lib/components/upload/ImageUploader.svelte";
    import { getColors, themes, type Theme } from "$lib/metadata";
    import type { Course } from "$lib/types";
    import { courseFilePath } from "itam-edu-common";
    import { getContext } from "svelte";

    let { readonly, course }: Props = $props();
    type Props = {
        readonly: boolean;
        course: Course;
    };

    const courseClone = $state(structuredClone($state.snapshot(course)));
    const themeOverride = getContext<{ theme: Theme | null }>("themeOverride");
    $effect(() => {
        themeOverride.theme = courseClone.theme as Theme;
    });

    async function save() {
        const result = await api({ fetch })
            .courses({ course: courseClone.id })
            .patch({
                theme: courseClone.theme,
                cover: courseClone.cover,
                icon: courseClone.icon,
                banner: courseClone.banner
            });

        if (result.status === 200) {
            await Promise.all([
                invalidate("app:course"),
                invalidate("app:courses")
            ]);
            alert("Изменения успешно сохранены.");
        } else {
            alert(result.status);
        }

        await invalidate("app:course");
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
                bind:filename={courseClone.cover}
                height="315px"
                aspectRatio="315/315"
                filenameToSrc={filename =>
                    courseFilePath(courseClone.id).public(filename)}
                onUpload={async file => {
                    const response = await api({ fetch })
                        .files.courses({ course: courseClone.id })
                        .post({ file });
                    if (response.error) {
                        alert(response.status);
                        return null;
                    }
                    const { filename } = response.data;
                    return filename;
                }}
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
                    браузере. Рекомендуется изображение размером 64x64.
                </p>
            </header>
            <ImageUploader
                bind:filename={courseClone.icon}
                height="128px"
                aspectRatio="1/1"
                filenameToSrc={filename =>
                    courseFilePath(courseClone.id).public(filename)}
                onUpload={async file => {
                    const response = await api({ fetch })
                        .files.courses({ course: courseClone.id })
                        .post({ file });
                    if (response.error) {
                        alert(response.status);
                        return null;
                    }
                    const { filename } = response.data;
                    return filename;
                }}
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
            bind:filename={courseClone.banner}
            aspectRatio="5/1"
            filenameToSrc={filename =>
                courseFilePath(courseClone.id).public(filename)}
            onUpload={async file => {
                const response = await api({ fetch })
                    .files.courses({ course: courseClone.id })
                    .post({ file });
                if (response.error) {
                    alert(response.status);
                    return null;
                }
                const { filename } = response.data;
                return filename;
            }}
            {readonly}
        />
    </div>
    {#if !readonly}
        <footer class="flex justify-end gap-4">
            <button class="btn w-max" onclick={save}>Сохранить</button>
        </footer>
    {/if}
</section>
