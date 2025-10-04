<script lang="ts">
    import { type PromptProps } from "$lib/Prompter.svelte";
    import { onMount } from "svelte";
    import type { CreateCourse } from "$lib/types";
    import Combobox from "$lib/components/Combobox.svelte";
    import type { UserDto } from "itam-edu-api/src/features/users/query";
    import { filePath } from "$lib/path";

    const { users, onConfirm, onCancel }: Props = $props();
    type Props = PromptProps<CreateCourse> & { users: UserDto[] };

    let dialog: HTMLDialogElement;
    onMount(() => {
        dialog.showModal();
    });

    let title: string = $state("");
    let slug: string = $state("");
    let year: number = $state(new Date().getFullYear());
    let semester: "autumn" | "spring" = $state(
        new Date().getMonth() <= 4 || new Date().getMonth() === 11
            ? "spring"
            : "autumn"
    );

    let ownerQuery: string = $state("");
    let owner: UserDto | null = $state(null);

    const minSlugLength = 3;
    const maxSlugLength = 24;
    const maxTitleLength = 32;

    const valid = $derived.by(() => {
        if (owner === null) {
            return false;
        }
        if (title.length === 0 || title.length > maxTitleLength) {
            return false;
        }
        if (
            slug.length < minSlugLength ||
            slug.length > maxSlugLength ||
            !slug.match(/[a-zA-Z0-9-]+/)
        ) {
            return false;
        }
        return true;
    });
</script>

<dialog
    class={[
        "modal overflow-visible",
        "hidden open:flex flex-col gap-5 w-150 px-10 pt-10 pb-12.5 m-auto text-on-surface bg-surface rounded-xl",
        "backdrop:bg-[black] backdrop:opacity-30"
    ]}
    onclose={() => onCancel()}
    bind:this={dialog}
>
    <header class="flex flex-col">
        <button
            class="self-end flex justify-center items-center h-8 w-8 border border-primary rounded-[8px]"
            aria-label="Закрыть"
            onclick={() => dialog.close()}
        >
            <i class="ph ph-x text-[12.5px]"></i>
        </button>
        <h2 class="self-center">Новый курс</h2>
    </header>
    <div class="flex flex-col gap-4">
        <label class="flex flex-col gap-1">
            <span>Название</span>
            <input
                class="input-small"
                bind:value={title}
                minlength={1}
                maxlength={maxTitleLength}
                required
                placeholder="Unreal Engine 5"
            />
        </label>
        <section class="flex gap-4">
            <label class="flex-1 flex flex-col gap-1">
                <span>Идентификатор</span>
                <input
                    class="input-small"
                    bind:value={slug}
                    oninput={() => {
                        slug = slug.replaceAll(" ", "-").toLowerCase();
                    }}
                    minlength={minSlugLength}
                    maxlength={maxSlugLength}
                    pattern="[a-zA-Z0-9\-]+"
                    placeholder="unreal-engine-5"
                />
            </label>
            <label class="flex flex-col gap-1">
                <span>Год</span>
                <input
                    class="input-small"
                    type="number"
                    step={1}
                    min={2020}
                    max={new Date().getFullYear() + 5}
                    required
                    bind:value={year}
                />
            </label>
            <label class="flex flex-col gap-1">
                <span>Семестр</span>
                <select class="input-small" bind:value={semester}>
                    <option value={"autumn"}>Осень</option>
                    <option value={"spring"}>Весна</option>
                </select>
            </label>
        </section>
        <section class="flex flex-col gap-1">
            <span>Владелец</span>
            <Combobox
                bind:query={ownerQuery}
                bind:value={owner}
                suggestions={users.filter(user => {
                    let searchWords = ownerQuery
                        .trim()
                        .toLowerCase()
                        .split(" ");
                    return searchWords.every(searchWord => {
                        const match = (s: string) =>
                            s.toLowerCase().includes(searchWord);
                        if (match("@" + user.tgUsername)) return true;
                        if (match(user.firstName)) return true;
                        if (match(user.lastName ?? "")) return true;
                        return false;
                    });
                })}
                placeholder="Начните вводить имя или Telegram-юзернейм..."
            >
                {#snippet selected(user)}
                    <div
                        class={[
                            "flex items-center gap-1.5 w-full h-11 px-2.5",
                            "bg-surface text-md-regular text-nowrap overflow-ellipsis outline-0"
                        ]}
                    >
                        <div
                            class="cover size-[24px] text-sm-regular rounded-2xs"
                            style:background-image={user.avatar
                                ? `url(${filePath(user.avatar)})`
                                : null}
                        >
                            <span>{user.tgUsername[0]}</span>
                        </div>
                        <span
                            class="text-md-regular text-nowrap overflow-ellipsis"
                        >
                            {user.firstName}
                            {user.lastName},
                        </span>
                        <span class="text-on-surface-muted"
                            >@{user.tgUsername}</span
                        >
                        <button
                            class="ml-auto p-2 rounded-full hover:bg-surface-tint"
                            aria-label="Удалить"
                            onclick={() => (owner = null)}
                        >
                            <i class="ph ph-x"></i>
                        </button>
                    </div>
                {/snippet}
                {#snippet suggestion(user, { highlighted })}
                    <div
                        class={[
                            "flex items-center gap-1.5 w-full h-11 px-2.5",
                            "text-md-regular text-nowrap overflow-ellipsis outline-0",
                            highlighted ? "bg-on-primary" : "bg-surface",
                            "hover:bg-on-primary focus:bg-on-primary"
                        ]}
                    >
                        <div
                            class="cover size-[24px] text-sm-regular rounded-2xs"
                            style:background-image={user.avatar
                                ? `url(${filePath(user.avatar)})`
                                : null}
                        >
                            <span>{user.tgUsername[0]}</span>
                        </div>
                        <span
                            class="text-md-regular text-nowrap overflow-ellipsis"
                        >
                            {user.firstName}
                            {user.lastName},
                        </span>
                        <span class="text-on-surface-muted"
                            >@{user.tgUsername}</span
                        >
                    </div>
                {/snippet}
                {#snippet empty()}
                    <span
                        class={[
                            "flex items-center gap-1.5 h-11 px-2.5",
                            "bg-surface text-md-regular text-on-surface-muted ITALIC"
                        ]}
                    >
                        Не найдено
                    </span>
                {/snippet}
            </Combobox>
        </section>
        <button
            class="btn big"
            disabled={!valid}
            onclick={() => {
                if (!owner) return;
                onConfirm({
                    title,
                    slug,
                    semester,
                    year,
                    ownerId: owner.id
                });
            }}
        >
            Создать курс
        </button>
    </div>
</dialog>
