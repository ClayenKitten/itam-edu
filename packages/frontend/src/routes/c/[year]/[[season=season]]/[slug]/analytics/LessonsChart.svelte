<script lang="ts">
    import { Chart } from "chart.js/auto";
    import "chartjs-adapter-date-fns";
    import { onMount } from "svelte";
    import { ru } from "date-fns/locale";
    import type { Attendee, LessonPartial, Student } from "$lib/types";

    let { lessons, attendees, students }: Props = $props();
    type Props = {
        lessons: LessonPartial[];
        attendees: Attendee[];
        students: Student[];
    };

    let canvas: HTMLCanvasElement;
    onMount(() => {
        new Chart(canvas, {
            type: "bar",
            data: {
                datasets: [
                    {
                        label: "Очно",
                        data: lessons.map(
                            l =>
                                attendees.filter(
                                    a =>
                                        a.format === "offline" &&
                                        a.lessonId === l.id &&
                                        students.some(s => s.id === a.userId)
                                ).length
                        ),
                        borderWidth: 1
                    },
                    {
                        label: "Онлайн",
                        data: lessons.map(
                            l =>
                                attendees.filter(
                                    a =>
                                        a.format === "online" &&
                                        a.lessonId === l.id &&
                                        students.some(s => s.id === a.userId)
                                ).length
                        ),
                        borderWidth: 1
                    }
                ],
                labels: lessons.map(
                    l =>
                        l.title.slice(0, 40) +
                        (l.title.length > 40 ? "..." : "")
                )
            },
            options: {
                indexAxis: "y",
                scales: {
                    x: {
                        stacked: true,
                        ticks: {
                            stepSize: 1
                        }
                    },
                    y: {
                        stacked: true
                    }
                },
                maintainAspectRatio: false
            }
        });
    });
</script>

<article class="h-80">
    <canvas bind:this={canvas}></canvas>
</article>
