<script lang="ts">
    import { onNavigate } from "$app/navigation";
    import { page } from "$app/state";
    import "../../app.css";

    let { data, children } = $props();

    let navOpen = $state(false);
    onNavigate(() => {
        navOpen = false;
    });
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
                : "bg-transparent text-text-opaque hover:bg-surface-light hover:text-text",
            "flex items-center justify-start gap-2.5",
            "h-12 w-full px-4 lg:rounded-sm"
        ]}
    >
        <i class="{current ? 'ph-fill' : 'ph'} ph-{icon} text-xl"></i>
        <span>{text}</span>
    </a>
{/snippet}

<div class="flex flex-col lg:flex-row w-full gap-5 pb-0 lg:p-5">
    <nav
        class={[
            "sticky top-0 lg:top-5 flex-shrink-0",
            "flex flex-row lg:flex-col gap-2.5 lg:gap-5",
            "h-[60px] lg:w-[260px] lg:h-[calc(100vh_-_40px)]",
            "bg-surface lg:bg-transparent",
            "lg:m-0 lg:p-0 z-20"
        ]}
    >
        <button
            aria-label="Toggle navigation menu"
            class="lg:hidden bg-surface aspect-square p-2"
            onclick={() => (navOpen = !navOpen)}
        >
            <i
                class={[
                    navOpen && "bg-surface-light",
                    "ph ph-list flex justify-center items-center w-full h-full",
                    "text-text text-2xl rounded"
                ]}
            ></i>
        </button>
        <div
            class={[
                navOpen ? "flex" : "hidden",
                "absolute top-[60px] h-[calc(100dvh_-_60px)] inset-x-0",
                "lg:static lg:flex",
                "lg:flex-1 flex-col lg:gap-2.5 lg:h-auto lg:px-4 lg:py-5",
                "bg-surface-dark lg:bg-surface lg:rounded"
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
            class="flex-1 flex lg:hidden justify-center items-center p-4 text-xl text-text bg-surface rounded"
        >
            ITAM.Education
        </a>
        <a
            href="/admin/profile"
            class="lg:flex gap-2.5 aspect-square lg:h-[80px] lg:aspect-auto bg-surface lg:rounded overflow-hidden"
        >
            <img
                src={data.user.avatar}
                alt=""
                class="aspect-square max-lg:p-2 max-lg:rounded"
            />
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
