<script lang="ts">
    import { coursePath } from "$lib/path.js";
    import { format as formatDate } from "date-fns";

    let { data } = $props();
</script>

<div class="flex flex-col gap-10 p-10">
    <header class="flex">
        <h1>Домашние задания</h1>
    </header>
    <div class="flex flex-col gap-2.5">
        {#each data.homeworks as homework}
            <a
                class="flex justify-between p-5 bg-surface rounded-xs shadow"
                href={`${coursePath(data.course)}/homeworks/${homework.id}`}
            >
                <div class="flex flex-col gap-3">
                    <header>
                        <h4>{homework.title}</h4>
                    </header>
                    {#if homework.deadline}
                        <span>
                            {formatDate(homework.deadline, "dd.MM.yy / HH:mm")}
                        </span>
                    {/if}
                </div>
                <i class="ph ph-caret-right text-[26px] self-center"></i>
            </a>
        {/each}
    </div>
</div>
