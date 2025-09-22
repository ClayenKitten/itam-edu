<script lang="ts">
    import { page } from "$app/state";
    import Header from "$lib/components/Header.svelte";
    import Loader from "$lib/components/Loader.svelte";
    import { userFilePath } from "itam-edu-common";
    import UsersTab from "./UsersTab.svelte";
    import CoursesTab from "./CoursesTab.svelte";

    let { data } = $props();

    const tabs = ["users", "courses", "calls"] as const;
    type Tab = (typeof tabs)[number];
    const tab = $derived.by<Tab>(() => {
        const param = page.url.searchParams.get("tab");
        if (tabs.some(t => t === param)) return param as Tab;
        return tabs[0];
    });
</script>

<div id="wrapper" class="flex flex-col bg-background">
    <Header user={data.user} courses={data.courses} standalone />
    <main class="flex flex-col h-full gap-7 m-10 min-[1200px]:mx-80">
        <h2>Административная панель</h2>
        <menu class="flex h-12 gap-2">
            <a
                class={["tabBtn", tab === "users" && "selected"]}
                href={`${page.url.origin}${page.url.pathname}`}
            >
                Пользователи
            </a>
            <a
                class={["tabBtn", tab === "courses" && "selected"]}
                href={`${page.url.origin}${page.url.pathname}?tab=courses`}
            >
                Курсы
            </a>
            <a
                class={["tabBtn", tab === "calls" && "selected"]}
                href={`${page.url.origin}${page.url.pathname}?tab=calls`}
            >
                Звонки
            </a>
        </menu>
        {#if tab === "users"}
            <UsersTab user={data.user} users={data.users} />
        {:else if tab === "courses"}
            <CoursesTab courses={data.courses} />
        {:else if tab === "calls"}
            WIP
        {/if}
    </main>
</div>
