<script lang="ts">
    import { invalidate } from "$app/navigation";
    import Header from "$lib/components/Header.svelte";
    import Loader from "$lib/components/Loader.svelte";
    import { coursePath } from "$lib/path";
    import { getToaster } from "$lib/Toaster.svelte";
    import type { CoursePartial } from "$lib/types";
    import type { CallDto } from "itam-edu-api/src/calls/dao";
    import type { User } from "itam-edu-common";
    import { onMount } from "svelte";

    let { user, courses, call, onReady }: Props = $props();
    type Props = {
        user: User | null;
        courses: CoursePartial[];
        call: CallDto;
        onReady: (options: { audio: boolean; video: boolean }) => void;
    };
    const toaster = getToaster();

    let course = $derived(courses.find(c => c.id === call.courseId) ?? null);

    onMount(async () => {
        await invalidate("app:call");
    });

    let isAwaitingApproval = $state(false);
    let enableMicrophone = $state(false);
    const onMicrophoneChange = async () => {
        if (enableMicrophone === true) {
            enableMicrophone = false;
            return;
        }

        isAwaitingApproval = true;
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            enableMicrophone = true;
        } catch {
            toaster.add("Не удалось получить доступ к микрофону", "error");
            enableMicrophone = false;
        } finally {
            isAwaitingApproval = false;
        }
    };
    let enableCamera = $state(false);
    const onCameraChange = async () => {
        if (enableCamera === true) {
            enableCamera = false;
            return;
        }

        isAwaitingApproval = true;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user" }
            });
            enableCamera = true;
            setTimeout(() => {
                videoElement!.srcObject = stream;
            }, 100);
        } catch (e) {
            toaster.add("Не удалось получить доступ к камере", "error");
            console.error(e);
            enableCamera = false;
        } finally {
            isAwaitingApproval = false;
        }
    };

    let videoElement: HTMLVideoElement | undefined = $state(undefined);
</script>

<div id="wrapper" class="flex flex-col items-stretch bg-background h-dvh">
    <Header {user} {courses} standalone />
    {#if call.endedAt === null}
        {#if user === null}
            <div
                class={[
                    "flex justify-center items-center gap-2 py-2 px-4",
                    "bg-danger text-on-danger text-lg-medium"
                ]}
            >
                <i class="ph-fill ph-warning"></i>
                Вы подключаетесь как гость. Ваше посещение не будет отмечено, а микрофон
                отключён.
            </div>
        {/if}
        <main
            class={[
                "mt-[7.5dvh] self-center p-6 flex flex-col gap-6",
                "bg-surface border-surface-border rounded-md shadow"
            ]}
        >
            <header class="flex flex-col gap-1">
                <h2>{call.title}</h2>
                {#if course}
                    <h5>
                        Курс
                        <a
                            class="text-primary hover:underline"
                            href={coursePath(course)}
                        >
                            {course.title}
                        </a>
                    </h5>
                {/if}
            </header>
            <div
                class="flex flex-col gap-4 bg-surface-dimmed aspect-[16/9] max-w-[90dvw] h-[40dvh] rounded-sm"
            >
                {#if enableCamera}
                    {#if enableCamera}
                        <!-- svelte-ignore a11y_media_has_caption -->
                        <video
                            class="size-full"
                            bind:this={videoElement}
                            autoplay
                            muted
                        ></video>
                    {:else}
                        <Loader />
                    {/if}
                {:else}
                    <div class="size-full flex justify-center items-center">
                        Предпросмотр видео
                    </div>
                {/if}
            </div>
            <menu class="flex justify-center gap-2">
                <label
                    class={["call-toggle", enableMicrophone && "enabled"]}
                    title={enableMicrophone
                        ? "Выключить микрофон"
                        : "Включить микрофон"}
                >
                    {#if enableMicrophone}
                        <i class="ph ph-microphone text-[22px]"></i>
                    {:else}
                        <i class="ph ph-microphone-slash text-[22px]"></i>
                    {/if}
                    <input
                        type="checkbox"
                        class="hidden"
                        checked={enableMicrophone}
                        onchange={onMicrophoneChange}
                        disabled={isAwaitingApproval}
                    />
                </label>
                <label
                    class={["call-toggle", enableCamera && "enabled"]}
                    title={enableCamera
                        ? "Выключить видеокамеру"
                        : "Включить видеокамеру"}
                >
                    {#if enableCamera}
                        <i class="ph ph-video-camera text-[22px]"></i>
                    {:else}
                        <i class="ph ph-video-camera-slash text-[22px]"></i>
                    {/if}
                    <input
                        type="checkbox"
                        class="hidden"
                        checked={enableCamera}
                        onchange={onCameraChange}
                        disabled={isAwaitingApproval}
                    />
                </label>
                <button
                    class="btn ml-auto"
                    onclick={() =>
                        onReady({
                            audio: enableMicrophone,
                            video: enableCamera
                        })}
                >
                    Подключиться
                    <i class="ph-fill ph-paper-plane-right text-[22px]"></i>
                </button>
            </menu>
        </main>
    {:else}
        <main
            class={[
                "mt-[7.5dvh] self-center p-6 flex flex-col gap-6",
                "bg-surface border-surface-border rounded-md shadow"
            ]}
        >
            <header class="flex flex-col gap-1">
                <h2>{call.title}</h2>
                {#if course}
                    <h5>
                        Курс
                        <a
                            class="text-primary hover:underline"
                            href={coursePath(course)}
                        >
                            {course.title}
                        </a>
                    </h5>
                {/if}
            </header>
            <div class="flex flex-col gap-1 bg-surface-dimmed p-6 rounded-md">
                <h4>Звонок закончился 🤙</h4>
                <p>
                    Спасибо, что были с нами! Запись скоро появится на
                    платформе.
                </p>
            </div>
        </main>
    {/if}
</div>
