<script lang="ts">
    import TipTap from "$lib/components/TipTap.svelte";
    import type { Lesson } from "$lib/types";

    let { lesson }: Props = $props();

    type Props = {
        lesson: Lesson;
    };
</script>

<section class="flex flex-col gap-6 p-7.5 rounded-xl bg-surface shadow">
    <header class="flex flex-col gap-2">
        <h3>Теория и материалы</h3>
        <p class="max-w-[800px] text-balance">
            Здесь вы можете написать теорию к своему занятию и прикрепить ссылки
            на материалы. Для форматирования можно использовать горячие клавиши,
            синтаксис Markdown и команды на “/”.
        </p>
    </header>
    <div
        class="min-h-[300px] p-5 border-2 border-on-primary rounded-sm focus-within:border-primary"
    >
        <TipTap bind:content={lesson.content} />
    </div>
</section>
