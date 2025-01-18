<script lang="ts">
    import { Value } from "@sinclair/typebox/value";
    import * as schema from "itam-edu-api/src/services/course/lesson/schema";

    let props: {
        id: string;
        popover?: "auto" | "manual";
        oncreate: (lesson: Lesson) => void;
    } = $props();

    let lesson = $state({ title: "", slug: "" });

    type Lesson = typeof lesson;
</script>

<div
    id={props.id}
    popover={props.popover ?? "auto"}
    class={[
        "[&:popover-open]:flex flex-col w-[480px] text-text bg-surface rounded",
        "backdrop:opacity-50 backdrop:bg-black backdrop:pointer-events-none"
    ]}
    ontoggle={() => {
        lesson = { title: "", slug: "" };
    }}
>
    <header class="flex p-6">
        <h1 class="text-lg font-bold">Add new lesson</h1>
    </header>
    <div class="flex flex-col px-6 gap-5">
        <label class="flex flex-col gap-1">
            <span class="text-sm">Title</span>
            <input bind:value={lesson.title} placeholder="JavaScript Basics" />
        </label>
        <label class="flex flex-col gap-1">
            <span class="text-sm">Slug</span>
            <input bind:value={lesson.slug} placeholder="js-basics" />
        </label>
    </div>
    <footer class="flex justify-end gap-5 p-6">
        <button
            popovertarget={props.id}
            popovertargetaction="hide"
            class="px-4 py-3 text-sm bg-surface-invert text-text-invert hover:opacity-95 rounded-sm"
        >
            Cancel
        </button>
        <button
            popovertarget={props.id}
            popovertargetaction="hide"
            class={[
                "px-4 py-3 text-sm bg-primary hover:opacity-95 rounded-sm",
                "disabled:bg-disabled disabled:italic"
            ]}
            disabled={!Value.Check(schema.createLesson, lesson)}
            onclick={() => props.oncreate(lesson)}
        >
            Add new lesson
        </button>
    </footer>
</div>
