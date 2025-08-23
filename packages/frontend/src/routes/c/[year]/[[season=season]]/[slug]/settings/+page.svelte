<script lang="ts">
    import InfoSection from "./InfoSection.svelte";
    import StaffSection from "./StaffSection.svelte";
    import DangerSection from "./DangerSection.svelte";
    import { onNavigate } from "$app/navigation";
    import { getContext } from "svelte";
    import StyleSection from "./StyleSection.svelte";

    let { data } = $props();

    let courseClone = $state(structuredClone(data.course));

    const themeContainer = getContext<{ theme: string }>("theme");

    onNavigate(() => {
        themeContainer.theme = data.course.theme;
    });
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
        bind:course={courseClone}
        readonly={data.course.permissions.course.update !== true}
    />
    <StyleSection
        bind:course={courseClone}
        readonly={data.course.permissions.course.update !== true}
    />
    <StaffSection
        course={data.course}
        staff={data.staff}
        readonly={data.course.permissions.staff.manage !== true}
    />
    <DangerSection course={data.course} user={data.user} />
</div>
