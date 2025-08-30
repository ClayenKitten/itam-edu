<script lang="ts">
    import { userFilePath } from "itam-edu-common";
    import AddUserDialog from "./AddUserDialog.svelte";
    import { format as formatDate } from "date-fns";
    import { ru } from "date-fns/locale";
    import api from "$lib/api";
    import { invalidate } from "$app/navigation";
    import type { StaffMember, Student } from "$lib/types";
    import { coursePath } from "$lib/path";
    import QrCodeDialog from "./QrCodeDialog.svelte";

    const { data } = $props();

    let addUserDialog: AddUserDialog;
    let qrCodeDialog: QrCodeDialog;

    const members = $derived([...data.students, ...data.staff]);
    const getMember = (id: string) => {
        return members.find(m => m.id === id) ?? null;
    };

    let search = $state("");
    const searchWords = $derived(search.trim().toLowerCase().split(" "));
    const processedAttendees = $derived(
        data.attendees
            .flatMap(attendee => {
                const member = getMember(attendee.userId);
                if (!member) return [];

                let order: number;
                if (member.role === "student") order = 1;
                else order = 0;

                return [
                    {
                        attendee,
                        member,
                        order
                    }
                ];
            })
            .filter(({ member }) => {
                return searchWords.every(searchWord => {
                    if (
                        ("@" + member.tgUsername.toLowerCase()).includes(
                            searchWord
                        )
                    ) {
                        return true;
                    }
                    if (member.firstName.toLowerCase().includes(searchWord)) {
                        return true;
                    }
                    if (member.lastName?.toLowerCase().includes(searchWord)) {
                        return true;
                    }
                    return false;
                });
            })
            .toSorted((a, b) => a.order - b.order)
    );

    const remove = async (user: Student | StaffMember) => {
        const msg = `Вы уверены, что хотите убрать отметку о посещении урока пользователем @${user.tgUsername}?`;
        if (!confirm(msg)) return;

        const result = await api({ fetch })
            .courses({ course: data.course.id })
            .lessons({ lesson: data.lesson.id })
            .attendees({ user: user.id })
            .delete();
        if (result.error) {
            alert(result.status);
            return;
        }
        await invalidate("app:attendees");
    };
</script>

<div class="max-w-[1000px] flex flex-col m-10 @min-[1200px]/main:mx-40 gap-10">
    <header class="flex flex-col gap-2.5">
        <a
            class="group self-start mb-2.5 flex items-center h-min gap-2 text-primary"
            href="{coursePath(data.course)}/lessons/{data.lesson.id}"
        >
            <i class="ph ph-caret-left text-[20px]"></i>
            <h5 class="group-hover:underline">К уроку</h5>
        </a>
        <h2>Посещаемость</h2>
        <p class="text-xl-medium text-on-surface-muted">
            Урок {data.lesson.position + 1}. {data.lesson.title}
        </p>
    </header>
    <div class="flex flex-col gap-7.5">
        <section class="flex gap-5">
            {@render summaryCard(
                data.attendees.length.toFixed(0),
                "Участников"
            )}
        </section>
        <article class="flex flex-col gap-5 p-6 rounded-lg shadow">
            <h3>Участники</h3>
            <menu class="flex h-11 gap-2">
                <input
                    class={[
                        "flex-1 mr-auto px-2.5 max-w-90",
                        "text-md-regular text-on-surface placeholder:text-on-surface-muted",
                        "bg-surface-tint border border-surface-border rounded-2xs"
                    ]}
                    type="search"
                    placeholder="Поиск..."
                    bind:value={search}
                />
                <button class="btn" onclick={() => addUserDialog.show()}>
                    <i class="ph ph-plus"></i>
                    <span>Отметить</span>
                </button>
                <button
                    class="btn square"
                    aria-label="Показать QR-код"
                    title="Показать QR-код"
                    onclick={() => qrCodeDialog.show()}
                >
                    <i class="ph ph-qr-code text-[24px]"></i>
                </button>
            </menu>
            <div
                class={[
                    "grid gap-y-4 gap-x-4 items-center",
                    "grid-cols-[minmax(300px,1fr)_repeat(3,minmax(100px,max-content))_1fr]"
                ]}
            >
                <div class="text-md-medium text-on-surface-muted">Имя</div>
                <div class="text-md-medium text-on-surface-muted">Время</div>
                <div class="text-md-medium text-on-surface-muted">Формат</div>
                <div class="text-md-medium text-on-surface-muted">Роль</div>
                <div></div>
                <hr class="border-surface-border my-1 col-span-full" />
                {#each processedAttendees as { attendee, member }}
                    <div class="flex gap-2">
                        <div
                            class="cover size-[50px] text-md-regular rounded-xs"
                            style:background-image={member?.avatar
                                ? `url(${userFilePath(member.id).avatar(
                                      member.avatar
                                  )})`
                                : null}
                        >
                            <span>{member?.tgUsername[0] ?? "?"}</span>
                        </div>
                        <div class="flex flex-col justify-between">
                            <span class="text-xl-medium">
                                {member?.firstName ?? "Неизвестный"}
                                {member?.lastName}
                            </span>
                            <span class="text-md-regular">
                                @{member?.tgUsername ?? "durov"}
                            </span>
                        </div>
                    </div>
                    <div
                        class="text-lg-medium cursor-help"
                        title={formatDate(
                            attendee.recordedAt,
                            "dd MMMM yyyy в HH:mm:ss (O)",
                            { locale: ru }
                        )}
                    >
                        {formatDate(attendee.recordedAt, "HH:mm", {
                            locale: ru
                        })}
                    </div>
                    <div
                        class={[
                            "text-lg-medium",
                            attendee.manuallyAddedBy && [
                                "underline",
                                "underline-offset-3",
                                "decoration-dotted",
                                "cursor-help"
                            ]
                        ]}
                        title={attendee.manuallyAddedBy
                            ? `Отмечен(а) вручную пользователем @${getMember(attendee.manuallyAddedBy)?.tgUsername ?? "durov"}`
                            : null}
                    >
                        {#if attendee.format === "offline"}
                            Офлайн
                        {:else if attendee.format === "online"}
                            Онлайн
                        {/if}
                    </div>
                    <div class="text-lg-medium">
                        {member
                            ? member.role === "student"
                                ? "Студент"
                                : "Преподаватель"
                            : ""}
                    </div>
                    <div class="ml-auto">
                        <button
                            class="btn secondary"
                            onclick={() => member && remove(member)}
                        >
                            Удалить
                        </button>
                    </div>
                {:else}
                    <div
                        class="flex flex-col items-center col-span-full mt-32 mb-24 gap-2"
                    >
                        <!-- Check the unfiltered data. -->
                        {#if data.attendees.length === 0}
                            <h4 class="text-on-surface-contrast">
                                Посещаемость ещё не отмечена 🚷
                            </h4>
                            <span
                                class="text-lg-regular text-on-surface-muted text-center max-w-150"
                            >
                                Покажите QR-код на уроке или отметьте участников
                                вручную. При подключении к звонку студенты
                                отмечаются автоматически.
                            </span>
                        {:else}
                            <h4 class="text-on-surface-contrast">
                                Ничего не нашлось! 🔎
                            </h4>
                            <span
                                class="text-lg-regular text-on-surface-muted text-center max-w-150"
                            >
                                Возможно, интересующий вас человек не посещал
                                этот урок.
                            </span>
                        {/if}
                    </div>
                {/each}
            </div>
        </article>
    </div>
    <AddUserDialog
        course={data.course}
        lesson={data.lesson}
        staff={data.staff}
        students={data.students}
        attendees={data.attendees}
        bind:this={addUserDialog}
    />
    <QrCodeDialog
        course={data.course}
        lesson={data.lesson}
        bind:this={qrCodeDialog}
    />
</div>

{#snippet summaryCard(primary: string, secondary: string)}
    <article class="w-90 flex flex-col gap-2 p-6 bg-surface rounded-sm shadow">
        <span class="text-h2 text-on-surface">{primary}</span>
        <span class="text-xl-medium text-on-surface">{secondary}</span>
    </article>
{/snippet}
