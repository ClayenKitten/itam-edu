<script lang="ts">
    import PlainEditor from "$lib/components/editor/PlainEditor.svelte";
    import ImageUploader from "$lib/components/upload/ImageUploader.svelte";
    import { formatLessonSchedule } from "$lib/format";
    import type { LessonSchedule } from "$lib/types";

    let {
        position,
        title = $bindable(),
        description = $bindable(),
        schedule,
        banner,
        onBannerChange
    }: Props = $props();

    type Props = {
        position: number | null;
        title: string;
        description: string | null;
        schedule: LessonSchedule | null;
        banner: string | null;
        onBannerChange: (file: File | null) => void;
    };
</script>

<section class="flex flex-col gap-6 p-7.5 rounded-xl bg-surface shadow">
    <header class="flex flex-col gap-2">
        {#if position !== null}
            <h2>Урок {position + 1}</h2>
        {:else}
            <h2>Новый урок</h2>
        {/if}
        {#if schedule}
            <p class="text-md-regular text-on-surface-muted">
                {formatLessonSchedule(schedule)}
            </p>
        {/if}
    </header>
    <label class="flex flex-col gap-2">
        <h4>Название</h4>
        <input class="input" bind:value={title} maxlength={80} />
    </label>
    <div class="flex flex-wrap gap-6">
        <label class="flex-1 flex flex-col gap-2 min-w-[min(100%,400px)]">
            <h4>Описание</h4>
            <div class="flex-1 min-h-[200px] max-h-[200px]">
                <PlainEditor bind:content={description} characterLimit={300} />
            </div>
        </label>
        <label class="shrink-0 flex flex-col gap-2">
            <h4>Обложка</h4>
            <div class="h-[200px]">
                <ImageUploader
                    url={banner}
                    onChange={onBannerChange}
                    aspectRatio="320/200"
                    height="200px"
                />
            </div>
        </label>
    </div>
</section>
