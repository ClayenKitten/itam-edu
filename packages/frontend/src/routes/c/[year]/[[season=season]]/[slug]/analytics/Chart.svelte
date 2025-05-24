<script lang="ts">
    import { Chart } from "chart.js/auto";
    import "chartjs-adapter-date-fns";
    import { onMount } from "svelte";
    import { ru } from "date-fns/locale";

    let { label, data }: Props = $props();

    let canvas: HTMLCanvasElement;
    onMount(() => {
        new Chart(canvas, {
            type: "line",
            data: {
                datasets: [
                    {
                        label,
                        data,
                        borderWidth: 1,
                        stepped: true
                    }
                ]
            },
            options: {
                maintainAspectRatio: false,
                parsing: {
                    xAxisKey: "timestamp",
                    yAxisKey: "value"
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: "Дата"
                        },
                        type: "time",
                        time: {
                            unit: "day",
                            displayFormats: {
                                day: "dd.MM.yy"
                            },
                            tooltipFormat: "dd MMMM yy hh:mm:ss"
                        },
                        adapters: {
                            date: {
                                locale: ru
                            }
                        },
                        ticks: {
                            display: true
                        },
                        bounds: "ticks"
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    });

    type Props = {
        label: string;
        data: { timestamp: number; value: number }[];
    };
</script>

<canvas bind:this={canvas}></canvas>
