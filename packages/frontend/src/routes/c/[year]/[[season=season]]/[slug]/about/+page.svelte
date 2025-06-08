<script lang="ts">
    import TipTap from "$lib/components/TipTap.svelte";
    import { courseFilePath, userFilePath } from "itam-edu-common";

    let { data } = $props();
</script>

<svelte:head>
    <title>О курсе | {data.course.title}</title>
</svelte:head>

<div
    class="flex flex-col w-full max-w-[1200px] mx-auto h-full p-10 pt-0 gap-3.5"
>
    <div
        class="banner w-full aspect-[5] shrink-0 mb-5 rounded-lg overflow-hidden"
        aria-hidden="true"
    >
        {#if data.course.banner}
            <img
                src={courseFilePath(data.course.id).public(data.course.banner)}
                alt=""
                class="w-full h-full object-cover object-center"
            />
        {/if}
    </div>
    <div class="flex flex-col gap-10">
        <header class="flex flex-col gap-3.5">
            <h2 class="flex gap-4">
                <span>{data.course.title}</span>
            </h2>
            {#if data.course.description}
                <p>{data.course.description}</p>
            {/if}
        </header>
        <section class="flex flex-col gap-7.5">
            <h3>Преподаватели</h3>
            <ul
                class="grid grid-cols-1 @min-[1200px]/main:grid-cols-2 auto-rows-[174px] gap-5"
            >
                {#each data.staff as staffMember}
                    <li class="flex gap-4 p-4 rounded-2xl shadow">
                        <div
                            class="flex justify-center items-center shrink-0 h-full aspect-square overflow-hidden rounded-lg bg-primary"
                            aria-hidden="true"
                        >
                            {#if staffMember.avatar}
                                <img
                                    src={userFilePath(staffMember.id).avatar(
                                        staffMember.avatar
                                    )}
                                    alt=""
                                />
                            {:else}
                                <span class="text-on-primary text-md-medium">
                                    {staffMember.tgUsername[0]}
                                </span>
                            {/if}
                        </div>
                        <div class="flex flex-col gap-5 overflow-hidden">
                            <header class="flex flex-col">
                                <h4 class="text-nowrap">
                                    {staffMember.firstName}
                                    {staffMember.lastName}
                                </h4>
                                <a
                                    class="text-primary text-md-regular hover:underline"
                                    href={`https://t.me/${staffMember.tgUsername}`}
                                >
                                    @{staffMember.tgUsername}
                                </a>
                            </header>
                            <p class="flex-[1]">{staffMember.bio}</p>
                        </div>
                    </li>
                {/each}
            </ul>
        </section>
        {#if data.course.about}
            <section class="flex flex-col gap-4.5">
                <h3>О курсе</h3>
                <TipTap bind:content={data.course.about} readonly />
            </section>
        {/if}
    </div>
</div>

<style>
    .banner {
        background: linear-gradient(
            -20deg,
            var(--color-primary),
            var(--color-on-primary)
        );
    }
</style>
