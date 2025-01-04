<script lang="ts">
    import { page } from "$app/state";
    import { getReasonPhrase } from "http-status-codes";
</script>

<div class="flex flex-col justify-center items-center w-full h-full p-5">
    <span class="text-3xl text-text font-bold">{page.status}</span>
    <span class="text-xl text-text">{getReasonPhrase(page.status)}</span>
    <button
        class="bg-primary h-12 mt-8 px-4 text-text font-bold rounded-full"
        onclick={() => {
            history.back();
        }}
    >
        Go back
    </button>
</div>
