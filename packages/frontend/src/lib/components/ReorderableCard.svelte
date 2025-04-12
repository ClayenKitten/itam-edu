<script lang="ts">
    let { id, title, subtitle, isDeleted, href, onDelete, onRecover }: Props =
        $props();

    type Props = {
        id: string | number;
        title: string;
        subtitle: string;
        href?: string;
        isDeleted: boolean;
        onDelete: () => void;
        onRecover: () => void;
    };
</script>

<li class="flex items-center w-full gap-1 group" data-id={id}>
    <div class="dnd-handle flex items-center justify-center w-7.5 h-7.5">
        <i class="ph ph-dots-six-vertical text-[19px]"></i>
    </div>
    <div
        class={[
            "flex grow items-center justify-between px-5 py-4",
            !isDeleted
                ? "bg-surface group-hover:bg-on-primary border border-primary"
                : "bg-on-surface-disabled border border-on-surface-muted",
            "transition-colors duration-100 rounded-sm"
        ]}
    >
        <div class="flex flex-col gap-1.75">
            <span class="text-comment">{title}</span>
            <span class="text-date">{subtitle}</span>
        </div>
        <menu
            class="flex gap-4 text-on-surface-muted group-hover:text-on-surface"
        >
            {#if href && !isDeleted}
                <a
                    class={[
                        "flex justify-center items-center w-9 h-9 border",
                        "text-on-surface-muted border-on-surface-muted rounded-2xs",
                        !isDeleted
                            ? "group-hover:text-primary group-hover:border-primary"
                            : "",
                        "hover:bg-surface transition-[background] duration-100"
                    ]}
                    aria-label="Открыть"
                    {href}
                    target="_blank"
                >
                    <i class="ph ph-arrow-square-out text-[18px]"></i>
                </a>
            {/if}
            <button
                class={[
                    "flex justify-center items-center w-9 h-9 border",
                    "text-on-surface-muted border-on-surface-muted rounded-2xs",
                    !isDeleted
                        ? "group-hover:text-primary group-hover:border-primary"
                        : "",
                    "hover:bg-surface transition-[background] duration-100"
                ]}
                aria-label="Удалить"
                onclick={() => (isDeleted ? onRecover() : onDelete())}
            >
                <i
                    class="ph ph-{!isDeleted
                        ? 'trash'
                        : 'arrow-counter-clockwise'} text-[20px]"
                ></i>
            </button>
        </menu>
    </div>
</li>
