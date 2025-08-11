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
                about: course.about
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
    <div class="flex gap-6">
        <label class="flex-1 flex flex-col gap-2">
            <header>
                <h4>Описание</h4>
                <p class="text-md-regular text-on-surface-muted text-balance">
                    Кратко расскажите, о чём ваш курс (до 500 символов).
                </p>
            </header>
            <textarea
                class="input h-[163px] resize-none"
                maxlength="500"
                disabled={readonly}
                bind:value={course.description}
            ></textarea>
        </label>
    </div>
    <div class="flex flex-col gap-2">
        <header>
            <h4>О курсе</h4>
            <p
                class="max-w-[800px] text-md-regular text-on-surface-muted text-balance"
            >
                Опишите курс подробнее: расскажите, как он будет проходить,
                укажите расписание занятий, перечислите ключевые навыки, которые
                освоят студенты. Добавьте советы по подготовке, полезные
                материалы и любую другую информацию, которая поможет вашим
                студентам.
            </p>
        </header>
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
