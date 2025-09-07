<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import { coursePath } from "$lib/path";

    let { data } = $props();
</script>

<div id="wrapper" class="flex flex-col min-h-dvh bg-background">
    <Header
        user={data.user}
        notifications={data.notifications}
        courses={data.courses}
        standalone
    />
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
