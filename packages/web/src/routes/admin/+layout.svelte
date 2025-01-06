<script lang="ts">
    import { page } from "$app/state";
    import "../../app.css";

    let { data, children } = $props();
</script>

<svelte:head>
    <title>ITAM.Education</title>
</svelte:head>

{#snippet link(text: string, icon: string, path: string, selected?: boolean)}
    {@const current = selected ?? page.url.pathname.startsWith(path)}
    <a
        href={path}
        class={[
            current
                ? "bg-primary text-text"
                : "bg-surface text-text-opaque hover:bg-surface-light hover:text-text",
            "flex items-center gap-2.5 h-[60px] w-[60px] rounded-sm",
            "sm:max-lg:justify-center sm:max-lg:p-0",
            "justify-start lg:h-12 lg:w-full px-4",
            "max-sm:w-[200px]"
        ]}
    >
        <i class="{current ? 'ph-fill' : 'ph'} ph-{icon} text-xl"></i>
        <span class="sm:max-lg:hidden">{text}</span>
    </a>
{/snippet}

<div class="flex flex-col lg:flex-row w-full gap-5 p-5">
    <nav
        class={[
            "sticky top-0 lg:top-5 flex-shrink-0",
            "flex flex-row lg:flex-col gap-2.5 lg:gap-5",
            "w-screen h-[100px] lg:w-[260px] lg:h-[calc(100vh_-_40px)]",
            "bg-surface-dark lg:bg-transparent",
            "-m-5 p-5 lg:m-0 lg:p-0 z-20"
        ]}
    >
        <button
            aria-label="Toggle navigation menu"
            class="mob-menu sm:hidden bg-surface aspect-square rounded peer"
        >
            <i
                class="ph ph-list flex justify-center items-center text-text text-2xl"
            ></i>
        </button>
        <div
            class={[
                "lg:flex-1 hidden sm:flex lg:flex-col lg:bg-surface lg:px-4 lg:py-5 lg:rounded gap-2.5",
                "peer-focus:flex hover:flex",
                "max-sm:absolute max-sm:flex-col max-sm:top-[calc(2_*_20px_+_60px)] max-sm:rounded max-sm:bg-surface"
            ]}
        >
            {@render link(
                "Home",
                "house",
                "/admin",
                page.url.pathname === "/admin"
            )}
            {@render link("Courses", "chalkboard-simple", "/admin/courses")}
            {@render link("Submissions", "files", "/admin/submissions")}
            {@render link("Calendar", "calendar", "/admin/calendar")}
        </div>
        <a
            href="/"
            class="flex-1 flex lg:hidden justify-center items-center p-4 text-xl text-text bg-surface rounded sm:rounded-sm"
        >
            ITAM.Education
        </a>
        <a
            href="/admin/profile"
            class="lg:flex gap-2.5 aspect-square lg:h-[80px] lg:aspect-auto bg-surface rounded sm:max-lg:rounded-sm overflow-hidden"
        >
            <img src={data.user.avatar} alt="" class="aspect-square" />
            <div
                class="hidden lg:flex flex-col justify-center gap-0.5 py-2 pr-3 overflow-hidden"
            >
                <h1
                    class="text-lg leading-5 text-text overflow-ellipsis overflow-hidden"
                >
                    <span class="text-nowrap">{data.user.firstName}</span>
                    <span class="text-nowrap">{data.user.lastName}</span>
                </h1>
                <h2
                    class="text-sm h-5 text-text-opaque overflow-ellipsis overflow-hidden text-nowrap"
                >
                    @{data.user.tgUsername}
                </h2>
            </div>
        </a>
    </nav>
    <main class="flex-1 overflow-x-hidden">
        {@render children()}
    </main>
</div>

<style lang="postcss">
    :global(body) {
        @apply bg-surface-dark;
    }
</style>
