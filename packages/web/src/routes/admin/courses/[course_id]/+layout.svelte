<script lang="ts">
    import { page } from "$app/state";

    const { data, children } = $props();

    const path = $derived(page.url.pathname);
    const baseUrl = `/admin/courses/${data.course.id}`;
    const linkClasses = (selected: boolean) => [
        selected
            ? "text-primary border-b-primary border-b-2"
            : "text-text-opaque hover:text-text",
        "flex justify-center items-center px-5 py-5 text-text text-regular font-bold hover:text-primary"
    ];
</script>

<section class="my-5 p-6 pb-0 bg-surface rounded">
    <header class="flex gap-10 pb-5">
        <div
            class="flex justify-center items-center flex-shrink-0 w-[100px] h-[100px] p-2.5 bg-surface-light rounded-sm"
        >
            <img
                src="https://github.com/sveltejs/branding/blob/master/svelte-logo-square.png?raw=true"
                alt=""
            />
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
    </header>
    <hr class="border-surface-light" />
    <nav class="flex gap-x-10">
        <a class={linkClasses(path === baseUrl)} href={baseUrl}>Overview</a>
        <a
            class={linkClasses(path.startsWith(`${baseUrl}/content`))}
            href={`${baseUrl}/content`}
        >
            Content
        </a>
        <a
            class={linkClasses(path.startsWith(`${baseUrl}/students`))}
            href={`${baseUrl}/students`}
        >
            Students
        </a>
        <a
            class={linkClasses(path.startsWith(`${baseUrl}/blog`))}
            href={`${baseUrl}/blog`}
        >
            Blog
        </a>
        <a
            class={linkClasses(path.startsWith(`${baseUrl}/feedback`))}
            href={`${baseUrl}/feedback`}
        >
            Feedback
        </a>
        <a
            class={linkClasses(path.startsWith(`${baseUrl}/settings`))}
            href={`${baseUrl}/settings`}
        >
            Settings
        </a>
    </nav>
</section>

{@render children()}
