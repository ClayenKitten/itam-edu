<script lang="ts">
    import { page } from "$app/stores";
    import "../../app.css";
    let { children, data } = $props();
</script>

<svelte:head>
    <title>ITAM.Education</title>
</svelte:head>

<div class="flex h-full">
    <aside class="flex flex-col w-56 bg-slate-500">
        <header
            class="flex justify-center items-center h-12 text-white font-bold"
        >
            <a href="https://itatmisis.ru" class="hover:underline">ITAM</a>
            .
            <a href="/" class="hover:underline">Education</a>
        </header>
        <a
            class="flex justify-center items-center h-12 text-white hover:bg-slate-400"
            href="/admin"
            class:underline={$page.url.pathname === "/admin"}
        >
            Dashboard
        </a>
        <a
            class="flex justify-center items-center h-12 text-white hover:bg-slate-400"
            href="/admin/courses"
            class:underline={$page.url.pathname.startsWith("/admin/courses")}
        >
            My courses
        </a>
        <a
            class="flex justify-center items-center h-12 text-white hover:bg-slate-400"
            href="/admin/students"
            class:underline={$page.url.pathname.startsWith("/admin/students")}
        >
            Students
        </a>
        <a
            class="flex justify-center items-center h-12 text-white hover:bg-slate-400"
            href="/admin/homeworks"
            class:underline={$page.url.pathname.startsWith("/admin/homeworks")}
        >
            Homeworks
        </a>
        <div class="flex-1"></div>
        <button
            class="flex justify-center items-center h-12 text-white hover:bg-slate-400"
        >
            Log out
        </button>
    </aside>
    <main class="p-8">
        {@render children()}
    </main>
</div>
