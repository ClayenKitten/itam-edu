<script lang="ts">
    import { invalidate, onNavigate } from "$app/navigation";
    import api from "$lib/api";
    import TipTap from "$lib/components/TipTap.svelte";
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
                title: course.title,
                description: course.description,
                theme: course.theme,
                about: course.about,
                logo: course.logo,
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
        <h2>Настройки курса</h2>
    </header>
    <label class="flex flex-col gap-2">
        <h4>Название</h4>
        <input class="input" disabled={readonly} bind:value={course.title} />
    </label>
    <div class=" flex gap-6">
        <label class="flex-1 flex flex-col gap-2">
            <h4>Краткое описание</h4>
            <textarea
                class="input h-[200px] resize-none"
                maxlength="1000"
                disabled={readonly}
                bind:value={course.description}
            ></textarea>
        </label>
    </div>
    <div class="flex flex-col gap-2 w-full">
        <h4 class="col-span-2">Стиль</h4>
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
    <div class="shrink-0 flex flex-col gap-2">
        <header class="flex flex-col gap-2">
            <h4>Баннер</h4>
            <p class="max-w-[800px] text-balance">
                Баннер отображается на главной странице курса и в разделе "О
                курсе". Рекомендуется загружать изображение размером не менее
                1600x320 пикселей.
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
        />
    </div>
    <div class="flex flex-col gap-2">
        <h3>О курсе</h3>
        <div
            class={[
                "h-full min-h-[300px] p-5 border-2 rounded-sm focus-within:border-primary",
                !readonly ? "border-on-primary" : "border-on-surface-disabled"
            ]}
        >
            <TipTap bind:content={course.about} {readonly} />
        </div>
    </div>
    {#if !readonly}
        <footer class="flex justify-end gap-4">
            <button class="btn w-max" onclick={save}>Сохранить</button>
        </footer>
    {/if}
</section>
