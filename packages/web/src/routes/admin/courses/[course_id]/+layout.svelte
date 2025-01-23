<script lang="ts">
    import { page } from "$app/state";
    import { coursePath } from "$lib/path.js";

    const { data, children } = $props();

    const path = $derived(page.url.pathname);
    const baseUrl = `/admin/courses/${data.course.id}`;
</script>

{#snippet link(text: string, icon: string, path: string, selected?: boolean)}
    {@const current = selected ?? page.url.pathname.startsWith(path)}
    <a
        class={[
            current
                ? "text-primary-light border-b-primary-light border-b-2"
                : "text-text-opaque hover:text-text",
            "flex justify-center items-center gap-1.5 px-1 lg:px-5 py-5 text-regular font-bold"
        ]}
        href={path}
    >
        <i class="ph-fill ph-{icon} text-2xl"></i>
        <span class="hidden sm:inline">{text}</span>
    </a>
{/snippet}

<section class="mb-5 p-6 pb-0 bg-surface lg:rounded">
    <header class="flex gap-10 pb-5">
        <div
            class="flex justify-center items-center flex-shrink-0 w-[100px] h-[100px] p-2.5 bg-surface-light rounded-sm"
        >
            {#if data.course.logo}<img src={data.course.logo} alt="" />{/if}
        </div>
        <div class="flex flex-col self-center gap-5 py-2.5">
            <h1 class="text-text text-2xl font-bold">{data.course.title}</h1>
            {#if data.course.description}
                <p class="text-text text-sm max-w-[600px]">
                    {data.course.description.substring(0, 200) +
                        (data.course.description.length > 200 ? "..." : "")}
                </p>
            {:else}
                <p class="text-text-opaque text-sm italic">No description</p>
            {/if}
        </div>
        <a
            href={`${coursePath(data.course)}`}
            target="_blank"
            class="self-center hidden md:flex items-center justify-center gap-1 ml-auto px-6 h-min text-lg py-2 text-text bg-success hover:opacity-95 rounded-sm"
        >
            <span>Open</span>
            <i class="ph-fill ph-arrow-square-out"></i>
        </a>
    </header>
    <hr class="border-surface-light" />
    <nav
        class="flex max-sm:justify-between sm:gap-x-4 lg:gap-x-10 overflow-x-auto"
    >
        {@render link("Overview", "house", baseUrl, path === baseUrl)}
        {@render link("Content", "article", `${baseUrl}/content`)}
        {@render link("Students", "student", `${baseUrl}/students`)}
        {#if data.course.isBlogEnabled}
            {@render link("Blog", "text-t", `${baseUrl}/blog`)}
        {/if}
        {#if data.course.isFeedbackEnabled}
            {@render link(
                "Feedback",
                "chat-teardrop-dots",
                `${baseUrl}/feedback`
            )}
        {/if}
        {@render link("Settings", "gear", `${baseUrl}/settings`)}
    </nav>
</section>

{@render children()}
