<script lang="ts">
    import TipTap from "$lib/components/TipTap.svelte";

    let { content = $bindable() }: Props = $props();

    type Props = {
        content: string | null;
    };
</script>

<section class="flex flex-col gap-6 p-7.5 rounded-xl bg-surface shadow">
    <header class="flex flex-col gap-2">
        <h3>Теория и материалы</h3>
        <p class="max-w-[600px] text-balance">
            Здесь вы можете написать текстовую теорию и прикрепить ссылки на
            материалы. Для форматирования можно использовать горячие клавиши,
            синтаксис Markdown и всплывающее меню.
        </p>
    </header>
    <div
        class="min-h-[300px] p-5 border-2 border-on-primary rounded-sm focus-within:border-primary"
    >
        <TipTap bind:content />
    </div>
</section>
