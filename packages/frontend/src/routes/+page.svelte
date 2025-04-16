<script lang="ts">
    import { coursePath } from "$lib/path";
    import LoginWindow from "$lib/windows/LoginWindow.svelte";

    let { data } = $props();

    let loginWindow: LoginWindow;
</script>

<LoginWindow bind:this={loginWindow} />

<div id="wrapper" class="flex flex-col min-h-dvh bg-background">
    <header class="flex items-center self-stretch px-8 py-2 shadow bg-surface">
        <h1 class="text-h3">
            <a class="itam" href="https://itatmisis.ru">ITAM</a> Education
        </h1>
        {#if !data.user}
            <button class="btn ml-auto" onclick={() => loginWindow.show()}>
                Войти
            </button>
        {:else}
            <a class="btn ml-auto" href="/home">
                На платформу
                <i class="ph ph-arrow-right text-[20px]"></i>
            </a>
        {/if}
    </header>
    <main class="flex flex-col gap-2 mx-auto max-w-[1000px] px-16 py-8">
        <h2 class="mt-8 mb-2">Пространство IT-образования</h2>
        <p class="indent-4">
            ITAM Education &mdash; это образовательное подразделение
            студенческого IT-сообщества
            <a class="text-primary underline" href="https://itatmisis.ru">
                ITAM
            </a>. Здесь мы создаем среду, где легко задавать вопросы, находить
            поддержку и вместе разбираться в сложных темах. Присоединяйся!
        </p>
        <h2 id="Курсы" class="mt-8 mb-2">Курсы</h2>
        <section class="flex flex-col gap-4">
            <p class="text-on-background indent-4">
                Курсы ITAM — это уникальная возможность быстро погрузится в
                интересующее тебя направление, получить знания от
                студентов-старшекурсников, выпускников и начать как можно
                быстрее применять эти знания на различных соревнованиях,
                проектах и стажировках.
            </p>
            <ul class="grid grid-cols-3 gap-8 mt-1">
                {#each data.courses as course}
                    <a
                        href={coursePath(course)}
                        class="flex flex-col gap-2 p-8 text-on-surface bg-surface shadow rounded-[8px]"
                    >
                        <h3>{course.title}</h3>
                        <p class="text-on-surface-muted">
                            {course.year}
                        </p>
                        {#if course.description}
                            <p
                                class="text-on-surface max-w-120 mt-4 line-clamp-4"
                            >
                                {course.description}
                            </p>
                        {/if}
                    </a>
                {/each}
            </ul>
        </section>
        <h2 id="Менторская программа" class="mt-8 mb-2">
            Менторская программа
        </h2>
        <section class="flex flex-col gap-4">
            <p class="indent-4">
                Менторство – это процесс, в рамках которого более опытное и
                знающее лицо (ментор) помогает в профессиональном развитии менее
                опытному человеку (менти) в процессе их взаимодействия.
                Программа менторства от ITAM.Alumni – это возможность получить
                ценные знания и опыт от профессионалов в области. Выбери
                интересного тебе специалиста, сформируй свой запрос и начни
                расти вместе с IT сообществом Университета МИСИС.
            </p>
            <a
                href="https://info.itatmisis.ru/mentors"
                target="_blank"
                class="btn w-max"
            >
                Менторская программа
                <i class="ph ph-arrow-right text-[20px]"></i>
            </a>
        </section>
    </main>
    <footer
        class="flex items-center px-8 bg-surface h-20 w-full mt-auto shadow"
    >
        © ITAM 2025
    </footer>
</div>

<style>
    .itam {
        background: linear-gradient(
            to right,
            rgb(137, 95, 255),
            rgb(78, 20, 78),
            rgb(170, 31, 170)
        );
        background-clip: text;
        -webkit-text-fill-color: transparent;
        transition: opacity 200ms ease-in-out;
    }
    .itam:hover {
        opacity: 80%;
    }
</style>
