<script lang="ts">
    import { page } from "$app/state";
</script>

<div class="flex flex-col justify-center items-center w-full h-full gap-8">
    <h1>Ошибка {page.status}</h1>
    <p class="text-h3">{page.error?.message}</p>
</div>
