// @ts-check

import { defineConfig } from "eslint/config";

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import jsdoc from "eslint-plugin-jsdoc";

export default defineConfig([
    eslint.configs.recommended,
    tseslint.configs.recommended,
    jsdoc.configs["flat/logical-typescript"],
    {
        rules: {
            "prefer-const": ["error", { destructuring: "all" }],
            "@typescript-eslint/no-unused-vars": [
                "warn",
                { varsIgnorePattern: "^_", argsIgnorePattern: "^_" }
            ]
        }
    }
]);
