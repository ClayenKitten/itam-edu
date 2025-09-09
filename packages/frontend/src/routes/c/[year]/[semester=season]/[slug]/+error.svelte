<script lang="ts">
    import { page } from "$app/state";
    import { coursePath } from "$lib/path";

    const description = $derived.by(() => {
        if (page.status === 404) {
            return "Страница не найдена 😿";
        }
        if (page.status === 422 || page.status >= 500) {
            return "Проблемы с нашей стороны 😿";
        }
        if (page.status === 403) {
            return "Доступ запрещён 🔒";
        }
        return null;
    });
</script>

<div class="flex flex-col justify-center items-center w-full h-full">
    <h1>{page.status}</h1>
    {#if description}
        <p class="text-xl-medium text-on-background">
            {description}
        </p>
    {/if}
    <a
        class="group self-center flex items-center h-min mt-8 gap-2 text-primary"
        href={`${coursePath(page.data.course)}/home`}
    >
        <i class="ph ph-caret-left text-[20px]"></i>
        <h5 class="group-hover:underline">На главную</h5>
    </a>
</div>
