<script lang="ts">
    import { page } from "$app/state";
    import { coursePath } from "$lib/path";

    const { isEmployee }: { isEmployee: boolean } = $props();
    const prefix = coursePath(page.params as any);
</script>

{#snippet btn(path: string, text: string, icon: string)}
    {@const startsWith = page.url.pathname.startsWith(prefix + path)}
    {@const enabled =
        (path === "/" && page.url.pathname === prefix) ||
        (path !== "/" && startsWith)}
    <a
        href={prefix + path}
        class={[
            "flex items-center gap-3 text-button p-2.5 rounded-xs",
            enabled
                ? "text-on-primary bg-primary"
                : "text-on-surface bg-transparent hover:bg-surface-tint"
        ]}
        data-sveltekit-preload-data="off"
    >
        <i class="ph ph-{icon} text-[24px]"></i>
        <span>{text}</span>
    </a>
{/snippet}

<nav
    class="sticky top-0 h-dvh row-span-2 flex flex-col gap-2 p-5 bg-surface shadow"
>
    {@render btn("/", "Главный экран", "house")}
    {@render btn("/lessons", "Занятия", "folder")}
    {@render btn("/homeworks", "Домашние задания", "book-open-text")}
    {@render btn("/about", "О курсе", "info")}
    {#if isEmployee}
        <hr class="text-on-surface-muted my-2" />
        {@render btn("/analytics", "Аналитика", "chart-line")}
        {@render btn("/settings", "Настройки", "gear-six")}
    {/if}
</nav>
