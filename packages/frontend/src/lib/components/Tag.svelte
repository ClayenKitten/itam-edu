<script lang="ts" module>
    export type TagKind =
        | "new"
        | "rejected"
        | "submitted"
        | "accepted"
        | "closed";
</script>

<script lang="ts">
    export let kind: TagKind | null;
</script>

{#if kind === "new"}
    <span
        class="py-2 px-3 rounded-2xs bg-[#ECEEFF] text-[#6E7CEC] text-md-regular"
    >
        Новое
    </span>
{:else if kind === "rejected"}
    <span
        class="py-2 px-3 rounded-2xs bg-[#FFEDEA] text-[#FF6A55] text-md-regular"
    >
        Отклонено
    </span>
{:else if kind === "submitted"}
    <span
        class="py-2 px-3 rounded-2xs bg-[#E7F4FB] text-[#2462D6] text-md-regular"
    >
        На проверке
    </span>
{:else if kind === "accepted"}
    <span
        class="py-2 px-3 rounded-2xs bg-[#E9FBE7] text-[#36D624] text-md-regular"
    >
        Принято
    </span>
{:else if kind === "closed"}
    <span
        class="py-2 px-3 rounded-2xs bg-[#f0f0f0] text-[#696969] text-md-regular"
    >
        Закрыто
    </span>
{:else}
    <!-- Transparent -->
    <span class="py-2 px-3 text-md-regular">&nbsp;</span>
{/if}
