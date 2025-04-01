<script lang="ts">
    let { onclick }: { onclick: () => void } = $props();
</script>

<button
    class="flex justify-center items-center w-11.5 h-11.5 bg-on-primary rounded-full basis-11.5 shrink-0"
    {onclick}
    aria-label="Редактировать"
>
    <i class="ph ph-pencil-simple text-primary text-[20px]"></i>
</button>
