<script lang="ts">
    const { size = "default" }: Props = $props();
    type Props = {
        size?: "default" | "small";
    };
</script>

<div class="size-full flex justify-center items-center">
    <span
        class={[
            "loader",
            size === "default" && "size-12 border-4",
            size === "small" && "size-6 border-3",
            "border-primary border-b-transparent rounded-[50%]"
        ]}
    ></span>
</div>

<style>
    .loader {
        animation: rotation 1s linear infinite;
    }

    @keyframes rotation {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
</style>
