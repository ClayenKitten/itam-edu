<script lang="ts">
    import RichEditor from "$lib/components/editor/RichEditor.svelte";

    let { content = $bindable() }: Props = $props();

    type Props = {
        content: string | null;
    };
</script>

<section class="flex flex-col gap-6 p-7.5 rounded-xl bg-surface shadow">
    <header class="flex flex-col gap-1">
        <h3>Теория и материалы</h3>
        <p class="text-md-regular text-on-surface-muted">
            Напишите теорию к уроку и прикрепите полезные материалы для
            изучения.
        </p>
    </header>
    <div class="flex min-h-[400px] max-h-[800px]">
        <RichEditor bind:content characterLimit={50000} />
    </div>
</section>
