import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";
import type { Config } from "tailwindcss";

export default {
    content: ["./src/**/*.{html,js,svelte,ts}"],

    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#5A3FB6",
                    light: "#9A63F0"
                },
                success: {
                    DEFAULT: "#0DA678",
                    light: "#10D096"
                },
                text: {
                    DEFAULT: "#EEF0F4",
                    opaque: "#7D8FA9"
                },
                surface: {
                    dark: "#161B21",
                    DEFAULT: "#1D232C",
                    light: "#3B4758"
                },
                danger: {
                    DEFAULT: "#E4003F"
                }
            },
            fontFamily: {
                sans: ["Roboto", "ui-sans-serif"]
            }
        },
        borderRadius: {
            none: "0",
            sm: "6px",
            DEFAULT: "12px",
            full: "9999px"
        }
    },

    plugins: [typography, forms]
} satisfies Config;
