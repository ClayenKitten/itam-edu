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
        course={courseClone}
        readonly={!data.user?.hasCoursePermission(
            data.course.id,
            "canEditInfo"
        )}
    />
    <StyleSection
        course={courseClone}
        readonly={!data.user?.hasCoursePermission(
            data.course.id,
            "canEditInfo"
        )}
    />
    <StaffSection
        bind:staff={data.staff}
        readonly={!data.user?.hasCoursePermission(data.course.id, "isOwner")}
    />
    <DangerSection course={courseClone} user={data.user} />
</div>
