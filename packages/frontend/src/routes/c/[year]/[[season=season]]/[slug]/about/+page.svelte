<script lang="ts">
    import { invalidate } from "$app/navigation";
    import IconButton from "$lib/components/IconButton.svelte";
    import TipTap from "$lib/components/TipTap.svelte";

    let { data } = $props();

    let editing = $state(false);

    const canEdit =
        data.permissions?.course.find(x => x.courseId === data.course.id)
            ?.permissions.canEditContent === true;

    async function save() {
        // TODO
    }
</script>

<svelte:head>
    <title>О курсе | {data.course.title}</title>
</svelte:head>

<div class="flex flex-col w-full max-w-[1200px] mx-auto h-full p-10 gap-3.5">
    <div
        class="banner basis-[191px] shrink-0 mb-5 rounded-lg overflow-hidden"
        aria-hidden="true"
    >
        {#if data.course.banner}
            <img
                src={data.course.banner}
                alt=""
                class="w-full h-full object-cover object-center"
            />
        {/if}
    </div>
    <div class="flex flex-col gap-10">
        <header class="flex flex-col gap-3.5">
            <h2 class="flex gap-4">
                <span>{data.course.title}</span>
                {#if canEdit && !editing}
                    <IconButton
                        icon="ph-pencil-simple"
                        title="Редактировать"
                        onclick={() => (editing = true)}
                    />
                {/if}
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
                            {#if staffMember.user.avatar}
                                <img src={staffMember.user.avatar} alt="" />
                            {:else}
                                <span class="text-on-primary text-comment">
                                    {staffMember.user.tgUsername[0]}
                                </span>
                            {/if}
                        </div>
                        <div class="flex flex-col gap-5 overflow-hidden">
                            <header class="flex flex-col">
                                <h3 class="text-nowrap">
                                    {#if staffMember.user.firstName}
                                        {staffMember.user.firstName}
                                        {staffMember.user.lastName}
                                    {:else}
                                        {staffMember.user.tgUsername}
                                    {/if}
                                </h3>
                                <a
                                    class="text-primary text-date hover:underline"
                                    href={`https://t.me/${staffMember.user.tgUsername}`}
                                >
                                    @{staffMember.user.tgUsername}
                                </a>
                            </header>
                            <p class="flex-[1]">{staffMember.user.bio}</p>
                        </div>
                    </li>
                {/each}
            </ul>
        </section>
        <section class="flex flex-col gap-4.5">
            {#if data.course.about || canEdit}
                <h3>О курсе</h3>
                {#if !editing && !data.course.about}
                    <p class="text-on-surface-muted italic">Пока пусто...</p>
                {:else}
                    <TipTap
                        bind:content={data.course.about}
                        readonly={!editing}
                    />
                {/if}
            {/if}
        </section>
    </div>
    {#if editing}
        <footer class="flex gap-4">
            <button
                class="btn text-primary bg-on-primary"
                onclick={async () => {
                    editing = false;
                    await invalidate("app:lesson");
                }}
            >
                Отменить
            </button>
            <button
                class="btn"
                onclick={async () => {
                    editing = false;
                    await save();
                    await invalidate("app:lesson");
                }}
            >
                Сохранить
            </button>
        </footer>
    {/if}
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
