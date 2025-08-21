<script lang="ts">
    import { goto, invalidate } from "$app/navigation";
    import api from "$lib/api";
    import type { User } from "itam-edu-common";
    import Avatar from "./Avatar.svelte";

    let { user }: Props = $props();
    type Props = {
        user: User;
    };

    let userInfo = $state(structuredClone(user.info));

    const save = async () => {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }

        const response = await api({ fetch }).users.me.patch({
            firstName: userInfo.firstName,
            lastName: userInfo.lastName === "" ? null : userInfo.lastName,
            avatar: userInfo.avatar,
            bio: userInfo.bio
        });
        if (response.error) {
            alert(response.status);
            return;
        }
        await invalidate("app:user");
    };
    let timer: number | null = $state(null);
    const DEBOUNCE_MS = 1500;
    const saveDebounced = () => {
        if (timer) clearTimeout(timer);
        timer = window.setTimeout(() => {
            save();
            alert("Изменения сохранены.");
        }, DEBOUNCE_MS);
    };
    const delayDebounce = () => {
        if (timer) {
            clearTimeout(timer);
            timer = window.setTimeout(() => {
                save();
                alert("Изменения сохранены.");
            }, DEBOUNCE_MS);
        }
    };

    const logout = async () => {
        const response = await api({ fetch }).users.sessions.current.delete();
        if (response.error) {
            alert(response.status);
            return;
        }
        await goto("/");
        await invalidate("app:user");
    };
</script>

<svelte:window
    onbeforeunload={e => {
        // Show "Are you sure you want to leave the page" popup if the debounce timer is active
        if (timer) e.preventDefault();
    }}
/>

<section
    class={[
        "w-105 flex flex-col gap-6 p-6",
        "border border-surface-border bg-surface shadow rounded-lg"
    ]}
>
    <div class="self-center flex flex-col gap-3">
        <Avatar
            {user}
            avatar={userInfo.avatar}
            onchange={avatar => {
                userInfo.avatar = avatar;
                save(); // No need to debounce.
            }}
        />
        <a
            class="text-xl-medium text-primary text-center hover:underline"
            href="https://t.me/{user.telegram.username}"
            target="_blank"
        >
            @{user.telegram.username}
        </a>
    </div>
    <div class="flex flex-col gap-5">
        <label class="flex flex-col gap-1.5">
            <span class="text-on-surface-muted text-md-regular">Имя</span>
            <input
                class="input"
                bind:value={userInfo.firstName}
                oninput={() => delayDebounce()}
                onchange={() => saveDebounced()}
            />
        </label>
        <label class="flex flex-col gap-1.5">
            <span class="text-on-surface-muted text-md-regular">Фамилия</span>
            <input
                class="input"
                bind:value={userInfo.lastName}
                oninput={() => delayDebounce()}
                onchange={() => saveDebounced()}
            />
        </label>
        <label class="flex flex-col gap-1.5">
            <span class="text-on-surface-muted text-md-regular">О себе</span>
            <textarea
                class="input h-30 resize-none"
                bind:value={userInfo.bio}
                oninput={() => delayDebounce()}
                onchange={() => saveDebounced()}
            ></textarea>
        </label>
    </div>
    <button class="btn secondary text-md-medium h-14" onclick={() => logout()}>
        <i class="ph ph-sign-out text-[18px]"></i>
        Выйти из аккаунта
    </button>
</section>
