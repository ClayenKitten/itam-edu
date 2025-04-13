<script lang="ts">
    import type { Course } from "$lib/types.js";
    import InfoSection from "./InfoSection.svelte";
    import StaffSection from "./StaffSection.svelte";
    import DangerSection from "./DangerSection.svelte";

    let { data } = $props();

    let course: Course = $state(structuredClone(data.course));
</script>

<svelte:head>
    <title>Настройки | {data.course.title}</title>
</svelte:head>

<div
    class={[
        "flex flex-col h-full py-10 gap-7",
        "max-w-[1000px] mx-10 @min-[1200px]/main:mx-40"
    ]}
>
    <InfoSection
        bind:course
        readonly={!data.user?.hasCoursePermission(course.id, "canEditInfo")}
    />
    <StaffSection
        bind:staff={data.staff}
        readonly={!data.user?.hasCoursePermission(course.id, "isOwner")}
    />
    <DangerSection
        bind:course
        readonly={!data.user?.hasCoursePermission(course.id, "isOwner")}
    />
</div>
