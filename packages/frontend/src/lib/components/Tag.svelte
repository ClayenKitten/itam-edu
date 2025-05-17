<script lang="ts" module>
    export type TagKind = "new" | "rejected" | "submitted" | "accepted";
</script>

<script lang="ts">
    export let kind: TagKind | null;
</script>

{#if kind === "new"}
    <span
        class="py-1.5 px-3.5 rounded-2xs bg-[#ECEEFF] text-[#6E7CEC] text-[14px]"
    >
        Новое
    </span>
{:else if kind === "rejected"}
    <span
        class="py-1.5 px-3.5 rounded-2xs bg-[#FFEDEA] text-[#FF6A55] text-[14px]"
    >
        Отклонено
    </span>
{:else if kind === "submitted"}
    <span
        class="py-1.5 px-3.5 rounded-2xs bg-[#E7F4FB] text-[#2462D6] text-[14px]"
    >
        На проверке
    </span>
{:else if kind === "accepted"}
    <span
        class="py-1.5 px-3.5 rounded-2xs bg-[#E9FBE7] text-[#36D624] text-[14px]"
    >
        Принято
    </span>
{:else}
    <!-- Transparent -->
    <span class="py-1.5 px-3.5 text-[14px]">&nbsp;</span>
{/if}
