<script lang="ts">
    import { invalidate } from "$app/navigation";
    import api from "$lib/api";
    import ImageUploader from "$lib/components/upload/ImageUploader.svelte";
    import { getColors, themes } from "$lib/theme";
    import type { Course } from "$lib/types";
    import { courseFilePath } from "itam-edu-common";
    import { getContext } from "svelte";

    let { readonly, course = $bindable() }: Props = $props();
    let themeContainer = getContext<{ theme: string }>("theme");

    type Props = {
        readonly: boolean;
        course: Course;
    };

    async function save() {
        const result = await api({ fetch })
            .courses({ course: course.id })
            .patch({
                theme: course.theme,
                cover: course.cover,
                icon: course.icon,
                banner: course.banner
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

    function applyTheme() {
        themeContainer.theme = course.theme;
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
                <label
                    class={[
                        "self-center justify-self-center",
                        "flex justify-center items-center",
                        "transition-all duration-200",
                        "size-12 has-checked:size-15 border rounded-full",
                        "bg-conic from-primary to-on-primary from-50% to-50%",
                        "border-primary-border opacity-60",
                        !readonly ? "hover:opacity-100 cursor-pointer" : "",
                        "has-checked:border-primary has-checked:opacity-100"
                    ]}
                    style:--color-primary={colors.primary}
                    style:--color-primary-border={colors.primaryBorder}
                    style:--color-on-primary={colors.onPrimary}
                >
                    <input
                        class="hidden"
                        type="radio"
                        name="theme"
                        value={theme}
                        bind:group={course.theme}
                        disabled={readonly}
                        onchange={applyTheme}
                    />
                </label>
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
                bind:filename={course.cover}
                height="315px"
                aspectRatio="315/315"
                filenameToSrc={filename =>
                    courseFilePath(course.id).public(filename)}
                onUpload={async file => {
                    const response = await api({ fetch })
                        .files.courses({ course: course.id })
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
                bind:filename={course.icon}
                height="128px"
                aspectRatio="1/1"
                filenameToSrc={filename =>
                    courseFilePath(course.id).public(filename)}
                onUpload={async file => {
                    const response = await api({ fetch })
                        .files.courses({ course: course.id })
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
            bind:filename={course.banner}
            aspectRatio="5/1"
            filenameToSrc={filename =>
                courseFilePath(course.id).public(filename)}
            onUpload={async file => {
                const response = await api({ fetch })
                    .files.courses({ course: course.id })
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
