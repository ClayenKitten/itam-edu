<script lang="ts">
    import Tag from "$lib/components/Tag.svelte";
    import { coursePath } from "$lib/path.js";
    import { format as formatDate } from "date-fns";

    let { data } = $props();
</script>

<div class="flex flex-col gap-10 p-10">
    <header class="flex">
        <h2>Домашние задания</h2>
    </header>
    <div class="flex flex-col gap-2.5">
        {#each data.homeworks as homework}
            <a
                class="flex justify-between p-5 bg-surface rounded-xs shadow"
                href={`${coursePath(data.course)}/homeworks/${homework.id}`}
            >
                <div class="flex flex-col gap-3">
                    <div class="flex items-center gap-3">
                        <header>
                            <h4>{homework.title}</h4>
                        </header>
                        <Tag 
                            kind = {data.tags.find(tag => tag.homeworkId === homework.id)?.tag as "new" | "submitted" | "rejected" | "accepted" ?? "new"}
                        />
                    </div>
                    {#if homework.deadline}
                        <p class="text-on-surface-contrast opacity-50">
                            <span>До</span>
                            <span>
                                {formatDate(
                                    homework.deadline,
                                    "dd.MM.yy / HH:mm"
                                )}
                            </span>
                        </p>
                    {/if}
                </div>
                <i class="ph ph-caret-right text-[26px] self-center"></i>
            </a>
        {/each}
    </div>
</div>
