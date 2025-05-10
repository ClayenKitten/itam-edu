<script lang="ts">
    import { invalidate } from "$app/navigation";
    import api from "$lib/api";
    import TipTap from "$lib/components/TipTap.svelte";
    import ImageUploader from "$lib/components/upload/ImageUploader.svelte";
    import type { Course } from "$lib/types";
    import { courseFilePath } from "itam-edu-common";

    let { readonly, course = $bindable() }: Props = $props();

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
                colorPrimary: course.colorPrimary,
                colorOnPrimary: course.colorOnPrimary,
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
    <div class="grid grid-cols-2 gap-y-2 gap-x-8 w-max">
        <h3 class="col-span-2">Стиль</h3>
        <label class="flex flex-col gap-2">
            <span>Акцентный цвет</span>
            <input
                class=""
                type="color"
                disabled={readonly}
                bind:value={course.colorPrimary}
            />
        </label>
        <label class="flex flex-col gap-2">
            <span>Цвет на акцентном</span>
            <input
                class=""
                type="color"
                disabled={readonly}
                bind:value={course.colorOnPrimary}
            />
        </label>
    </div>
    <label class="shrink-0 flex flex-col gap-2">
        <header class="flex flex-col gap-2">
            <h4>Баннер</h4>
            <p class="max-w-[800px] text-balance">
                Баннер отображается на главной странице курса и в разделе "О
                курсе". Рекомендуется загружать изображение размером не менее
                1600x191 пикселей.
            </p>
        </header>
        <ImageUploader
            bind:filename={course.banner}
            aspectRatio="4/1"
            maxHeight="191px"
            filenameToSrc={filename =>
                courseFilePath(course.id).public(filename)}
            onUpload={async file => {
                const response = await api({ fetch })
                    .courses({ course: course.id })
                    .files.post({ file });
                if (response.error) {
                    alert(response.status);
                    return null;
                }
                const { filename } = response.data;
                return filename;
            }}
        />
    </label>
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
