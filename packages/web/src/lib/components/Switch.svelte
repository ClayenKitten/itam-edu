<script lang="ts">
    let { value: checked = $bindable() }: { value?: boolean } = $props();
</script>

<input type="checkbox" bind:checked class="sr-only peer" />
<div
    class={[
        "relative w-11 h-6 peer",
        "bg-surface-light rounded-full dark:border-gray-600 peer-checked:bg-primary",
        "peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all",
        "peer-focus:outline-none peer-focus:ring-1 peer-focus:ring-primary-light",
        "cursor-pointer"
    ]}
></div>
