import {Plugin, TFile, TAbstractFile} from 'obsidian';
import {DEFAULT_SETTINGS, DefaultLanguageSettings} from "./types";
import {SettingTab} from "./SettingTab";
import * as yaml from 'js-yaml';

export default class LanguageInjectorByTagPlugin extends Plugin {
    settings: DefaultLanguageSettings = DEFAULT_SETTINGS;
    //标记是否正在处理文件，避免死循环
    private isProcessing = false;

    async onload() {
        const loadedData = await this.loadData();
        this.settings = {...DEFAULT_SETTINGS, ...(loadedData as Partial<DefaultLanguageSettings> || {})};

        this.addSettingTab(new SettingTab(this.app, this));
        this.registerEvent(this.app.vault.on('modify', this.handleFileModify.bind(this)));
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    private async handleFileModify(file: TAbstractFile) {
        //  非 md 文件跳过
        if (!(file instanceof TFile) || file.extension !== 'md') return;
        if (this.isProcessing) return;

        try {
            // 标记为正在处理
            this.isProcessing = true;

            const content = await this.app.vault.cachedRead(file);
            const frontmatter = this.parseFrontMatterFromContent(content);
            const langValue = frontmatter?.[this.settings.customLanguageProperty];
            const defaultLang = typeof langValue === 'string' ? langValue : '';

            if (!defaultLang) return;

            const newContent = this.updateCodeBlocks(content, defaultLang);
            // 4. 只有内容真的变化且非空时才修改（避免空修改触发循环）
            if (newContent && newContent !== content) {
                await this.app.vault.modify(file, newContent);
            }
        } finally {
            // 5. 无论是否出错，都标记为处理完成
            this.isProcessing = false;
        }
    }

    parseFrontMatterFromContent(content: string): Record<string, unknown> | null {
        const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
        const match = content.match(frontmatterRegex);

        if (!match) return null;

        try {
            return yaml.load(match[1]) as Record<string, unknown>;
        } catch {
            return null;
        }
    }

    updateCodeBlocks(content: string, defaultLanguage: string): string {
        const codeBlockRegex = /```([^\n]*)\n([\s\S]*?)\n```/g;

        return content.replace(codeBlockRegex, (match, language, code) => {
            const trimmedLanguage = language.trim();

            if (this.settings.isReplace) {
                return `\`\`\`${defaultLanguage}\n${code.trimEnd()}\n\`\`\``;
            } else {
                return trimmedLanguage === ''
                    ? `\`\`\`${defaultLanguage}\n${code.trimEnd()}\n\`\`\``
                    : match;
            }
        });
    }
}