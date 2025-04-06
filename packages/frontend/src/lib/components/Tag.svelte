<script lang="ts">
    export let kind: "new" | "rejected" | "submitted" | "accepted" = "new";
</script>

{#if kind === "new"}
    <span
        class="py-1.5 px-3.5 rounded-[10px] bg-[#ECEEFF] text-[#6E7CEC] text-[14px] font-[537]"
        >Новое</span
    >
{:else if kind === "rejected"}
    <span
        class="py-1.5 px-3.5 rounded-[10px] bg-[#FFEDEA] text-[#FF6A55] text-[14px]"
        >Отклонено</span
    >
{:else if kind === "submitted"}
    <span
        class="py-1.5 px-3.5 rounded-[10px] bg-[#E7F4FB] text-[#2462D6] text-[14px]"
        >Отправлено</span
    >
{:else}
    <span
        class="py-1.5 px-3.5 rounded-[10px] bg-[#E9FBE7] text-[#36D624] text-[14px]"
        >Принято</span
    >
{/if}
