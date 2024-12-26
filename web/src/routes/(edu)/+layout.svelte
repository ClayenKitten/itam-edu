<script lang="ts">
    import { coursePath } from "$lib/path";
    import "../../app.css";
    let { children, data } = $props();
</script>

<svelte:head>
    <title>ITAM.Education</title>
</svelte:head>

<div class="flex flex-col h-full">
    <header
        class="flex justify-between items-center h-16 px-4 text-xl text-white bg-neutral-800"
    >
        <div class="itam">
            <a
                href="https://itatmisis.ru"
                class="hover:underline underline-offset-4"
            >
                ITAM
            </a>.<a href="/" class="hover:underline underline-offset-4">
                Education
            </a>
            {#if data.course}
                {" / "}
                <a
                    href={coursePath(data.course)}
                    class="hover:underline underline-offset-4"
                >
                    {data.course.title}
                </a>
            {/if}
        </div>
        <a
            href="/me"
            class="h-10 block bg-white aspect-square rounded-full overflow-hidden"
        >
            <img alt="Profile" />
        </a>
    </header>
    <div class="flex-1">
        {@render children()}
    </div>
    <footer
        class="flex justify-between items-center h-16 px-4 text-xl text-white bg-neutral-800"
    >
        <div class="itam"><a href="https://itatmisis.ru">ITAM</a></div>
        <div class="madeby">
            Made by
            <a
                href="https://clayenkitten.dev"
                target="_blank"
                class="underline underline-offset-4"
            >
                ClayenKitten
            </a>
        </div>
    </footer>
</div>
