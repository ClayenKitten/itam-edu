<script lang="ts">
    import { page } from "$app/state";
    import { coursePath } from "$lib/path";
</script>

<div class="flex flex-col justify-center items-center w-full h-full">
    <h2>
        {#if page.status === 404}
            Такой страницы не существует
        {:else}
            Ошибка {page.status}
        {/if}
    </h2>
    <a
        class="text-h4 text-primary underline mt-4"
        href={coursePath(page.data.course)}
    >
        На главную
    </a>
</div>
