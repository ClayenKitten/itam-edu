<script lang="ts">
    import { invalidate } from "$app/navigation";
    import api from "$lib/api";
    import TipTap from "$lib/components/TipTap.svelte";
    import type { Course } from "$lib/types";

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
            <h4>Описание</h4>
            <textarea
                class="input h-[200px] resize-none"
                maxlength="1000"
                disabled={readonly}
                bind:value={course.description}
            ></textarea>
        </label>
        <label class="shrink-0 flex flex-col gap-2">
            <h4>Логотип</h4>
            <div
                class={[
                    "border-2 rounded-sm overflow-hidden focus-within:border-primary",
                    !readonly
                        ? "border-on-primary"
                        : "border-on-surface-disabled"
                ]}
            >
                <div
                    class="group relative flex justify-center items-center h-[200px] aspect-[318/200] cursor-pointer"
                >
                    <input
                        class="h-0 w-0 outline-0"
                        type="file"
                        disabled={readonly}
                    />
                    {#if course.banner}
                        <img
                            class="object-contain"
                            src={course.banner}
                            alt=""
                        />
                        {#if !readonly}
                            <button
                                class={[
                                    "absolute top-4 right-4 flex items-center justify-center h-[46px] w-[46px]",
                                    "rounded-full bg-primary text-on-primary hover:bg-on-primary hover:text-primary",
                                    "transition-colors duration-100"
                                ]}
                                onclick={() => (course.banner = null)}
                                aria-label="Удалить"
                            >
                                <i class="ph ph-trash text-[20px]"></i>
                            </button>
                        {/if}
                    {:else}
                        <div
                            class={[
                                "flex items-center justify-center h-[46px] w-[46px]",
                                !readonly
                                    ? "bg-primary text-on-primary group-hover:bg-on-primary group-hover:text-primary"
                                    : "bg-on-surface-disabled text-on-surface-contrast",
                                "rounded-full transition-colors duration-100"
                            ]}
                        >
                            <i class="ph ph-upload-simple text-[20px]"></i>
                        </div>
                    {/if}
                </div>
            </div>
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
