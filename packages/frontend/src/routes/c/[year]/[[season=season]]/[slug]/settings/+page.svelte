<script lang="ts">
    import InfoSection from "./InfoSection.svelte";
    import StaffSection from "./StaffSection.svelte";
    import DangerSection from "./DangerSection.svelte";
    import StyleSection from "./StyleSection.svelte";

    let { data } = $props();
</script>

<div
    class={[
        "flex flex-col h-full py-10 gap-7",
        "max-w-[1000px] mx-10 @min-[1200px]/main:mx-40"
    ]}
>
    <InfoSection
        course={data.course}
        readonly={data.course.permissions.course.update !== true}
    />
    <StyleSection
        course={data.course}
        readonly={data.course.permissions.course.update !== true}
    />
    <StaffSection
        course={data.course}
        staff={data.staff}
        readonly={data.course.permissions.staff.manage !== true}
    />
    <DangerSection course={data.course} user={data.user} />
</div>
