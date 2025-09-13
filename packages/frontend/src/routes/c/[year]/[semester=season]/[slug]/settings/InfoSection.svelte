<script lang="ts">
    import { invalidate } from "$app/navigation";
    import api from "$lib/api";
    import PlainEditor from "$lib/components/editor/PlainEditor.svelte";
    import RichEditor from "$lib/components/editor/RichEditor.svelte";
    import { getToaster } from "$lib/Toaster.svelte";
    import type { Course } from "$lib/types";

    let { readonly, course }: Props = $props();
    type Props = {
        readonly: boolean;
        course: Course;
    };
    const toaster = getToaster();

    const courseClone = $state(structuredClone($state.snapshot(course)));

    async function save() {
        const result = await api({ fetch })
            .courses({ course: courseClone.id })
            .patch({
                title: courseClone.title,
                description: courseClone.description,
                about: courseClone.about
            });
        if (result.error) {
            toaster.add("Не удалось сохранить изменения", "error");
            return;
        }
        await Promise.all([
            invalidate("app:course"),
            invalidate("app:courses")
        ]);
        toaster.add("Изменения сохранены");
    }
</script>

<section class="flex flex-col gap-6 p-7.5 rounded-xl bg-surface shadow">
    <label class="flex flex-col gap-2">
        <h4>Название</h4>
        <input
            class="input"
            disabled={readonly}
            bind:value={courseClone.title}
        />
    </label>
    <div class="flex flex-col gap-4">
        <header class="flex flex-col gap-1">
            <h4>Описание</h4>
            <p class="text-md-regular text-on-surface-muted text-balance">
                Кратко расскажите, о чём ваш курс.
            </p>
        </header>
        <div class="flex-1 min-h-[160px] max-h-[240px]">
            <PlainEditor
                bind:content={courseClone.description}
                {readonly}
                characterLimit={500}
            />
        </div>
    </div>
    <div class="flex flex-col gap-4">
        <header class="flex flex-col gap-1">
            <h4>О курсе</h4>
            <p class="text-md-regular text-on-surface-muted text-balance">
                Опишите курс подробнее: расскажите, как он будет проходить,
                укажите расписание занятий, перечислите ключевые навыки, которые
                освоят студенты. Добавьте советы по подготовке, полезные
                материалы и любую другую информацию, которая поможет вашим
                студентам.
            </p>
        </header>
        <div class="flex-1 min-h-[300px] max-h-[600px]">
            <RichEditor
                bind:content={courseClone.about}
                {readonly}
                characterLimit={50000}
            />
        </div>
    </div>
    {#if !readonly}
        <footer class="flex justify-end gap-4">
            <button class="btn w-max" onclick={save}>Сохранить</button>
        </footer>
    {/if}
</section>
