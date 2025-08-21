<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import UserInfoPanel from "./UserInfoPanel.svelte";
    import CoursesPanel from "./CoursesPanel.svelte";

    let { data } = $props();
</script>

<svelte:head>
    <title>Профиль | ITAM Education</title>
</svelte:head>

<div id="wrapper" class="flex flex-col bg-background">
    <Header
        user={data.user}
        notifications={data.notifications}
        courses={data.courses}
        standalone
    />
    <main class="self-center flex flex-col gap-10 py-12.5 px-10">
        <h2>Профиль</h2>
        <div class="flex gap-6 flex-wrap justify-between items-start">
            <UserInfoPanel user={data.user} />
            <CoursesPanel user={data.user} courses={data.courses} />
        </div>
    </main>
</div>
