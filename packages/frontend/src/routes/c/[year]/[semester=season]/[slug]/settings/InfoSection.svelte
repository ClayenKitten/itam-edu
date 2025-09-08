<script lang="ts">
    import { invalidate } from "$app/navigation";
    import api from "$lib/api";
    import TipTap from "$lib/components/TipTap.svelte";
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
                bind:value={courseClone.description}
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
                !readonly
                    ? "border-primary-border"
                    : "border-on-surface-disabled"
            ]}
        >
            <TipTap bind:content={courseClone.about} {readonly} />
        </div>
    </div>
    {#if !readonly}
        <footer class="flex justify-end gap-4">
            <button class="btn w-max" onclick={save}>Сохранить</button>
        </footer>
    {/if}
</section>
