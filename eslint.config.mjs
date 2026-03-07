import {defineConfig} from "eslint/config";
import typescriptParser from "@typescript-eslint/parser";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import obsidianmd from "eslint-plugin-obsidianmd";

export default defineConfig([
    //继承 obsidianmd 插件的推荐规则
    ...obsidianmd.configs.recommended,
    {
        files: ["**/*.ts"],
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {project: "./tsconfig.json"},
        },

        // 启用 @typescript-eslint 插件. 配置规则（启用 no-explicit-any）
        plugins: {
            "@typescript-eslint": typescriptPlugin,
        },
        rules: {
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
        },
    },

]);