<script lang="ts">
    import { Chart } from "chart.js/auto";
    import "chartjs-adapter-date-fns";
    import { onMount } from "svelte";
    import type { HomeworkPartial, SubmissionPartial } from "$lib/types";

    let { homeworks, submissions }: Props = $props();
    type Props = {
        homeworks: HomeworkPartial[];
        submissions: SubmissionPartial[];
    };

    let canvas: HTMLCanvasElement;
    onMount(() => {
        new Chart(canvas, {
            type: "bar",
            data: {
                datasets: [
                    {
                        label: "Приняты",
                        data: homeworks.map(
                            hw =>
                                submissions.filter(
                                    s =>
                                        s.homework.id === hw.id &&
                                        s.accepted === true
                                ).length
                        ),
                        borderWidth: 1
                    },
                    {
                        label: "Ждут проверки",
                        data: homeworks.map(
                            hw =>
                                submissions.filter(
                                    s =>
                                        s.homework.id === hw.id &&
                                        s.accepted === null
                                ).length
                        ),
                        borderWidth: 1
                    }
                ],
                labels: homeworks.map(
                    hw =>
                        hw.title.slice(0, 40) +
                        (hw.title.length > 40 ? "..." : "")
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
