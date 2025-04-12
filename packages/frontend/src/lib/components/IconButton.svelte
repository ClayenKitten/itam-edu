<script lang="ts">
    let { onclick, icon, title }: Props = $props();

    type Props = {
        onclick: () => void;
        icon: `ph-${string}`;
        title?: string;
    };
</script>

<button
    class={[
        "flex justify-center items-center w-11.5 h-11.5 bg-on-primary rounded-xs basis-11.5 shrink-0",
        "border border-on-primary hover:border-primary transition-colors duration-100"
    ]}
    {onclick}
    aria-label={title}
    {title}
>
    <i class="ph {icon} text-primary text-[20px]"></i>
</button>
