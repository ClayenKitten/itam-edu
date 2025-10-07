<script lang="ts">
    import { coursePath, filePath } from "$lib/path";
    import type { Call, CoursePartial } from "$lib/types";
    import Loader from "$lib/components/Loader.svelte";
    import { format } from "date-fns";

    const { calls, courses }: Props = $props();
    type Props = {
        calls: Promise<Call[]>;
        courses: CoursePartial[];
    };
</script>

<article class="flex flex-col gap-5 p-6 rounded-lg shadow">
    <div
        class={[
            "grid gap-y-4 gap-x-12 items-center",
            "grid-cols-[1fr_repeat(3,max-content)]"
        ]}
    >
        <div class="text-md-medium text-on-surface-muted">Название</div>
        <div class="text-md-medium text-on-surface-muted">Начало</div>
        <div class="text-md-medium text-on-surface-muted">Конец</div>
        <div class="text-md-medium text-on-surface-muted">Время</div>
        <hr class="border-surface-border my-1 col-span-full" />
        {#await calls}
            <div class="col-span-full py-40">
                <Loader />
            </div>
        {:then calls}
            {#each calls as call (call.id)}
                {@const course =
                    courses.find(c => c.id === call.courseId) ?? null}
                <div class="flex gap-4">
                    <a
                        class={[
                            "cover aspect-[320/200] h-[75px] text-on-primary text-md-regular",
                            "border bg-on-primary border-primary-border hover:border-primary rounded-xs"
                        ]}
                        style:background-image={call.cover
                            ? `url(${filePath(call.cover)})`
                            : null}
                        href={`/calls/${call.id}`}
                        aria-label="Подключиться"
                    >
                        {#if call.endedAt === null}
                            <i
                                class="ph ph-phone-outgoing text-[22px] text-primary"
                            ></i>
                        {:else}
                            <i
                                class="ph ph-list-bullets text-[22px] text-primary"
                            ></i>
                        {/if}
                    </a>
                    <div class="flex flex-col gap-1">
                        <span class="text-xl-medium wrap-anywhere">
                            {call.title}
                        </span>
                        {#if course}
                            <div class="text-md-medium">
                                Курс
                                <a
                                    class="text-primary hover:underline"
                                    href={coursePath(course)}
                                >
                                    {course.title}
                                </a>
                            </div>
                        {/if}
                    </div>
                </div>
                <div class="text-lg-medium">
                    {format(call.startedAt, "dd.MM.yyyy HH:mm")}
                </div>
                <div class="text-lg-medium">
                    {#if call.endedAt}
                        {format(call.endedAt, "dd.MM.yyyy HH:mm")}
                    {:else}
                        <span class="text-on-surface-muted italic"
                            >Ещё идёт</span
                        >
                    {/if}
                </div>
                <div>
                    {#if call.endedAt}
                        {Math.floor(
                            (call.endedAt.getTime() -
                                call.startedAt.getTime()) /
                                (60 * 1000)
                        )} минут
                    {:else}
                        -
                    {/if}
                </div>
            {/each}
        {/await}
    </div>
</article>
