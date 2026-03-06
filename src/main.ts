import {Plugin, TFile, TAbstractFile} from 'obsidian';
import {DEFAULT_SETTINGS, DefaultLanguageSettings} from "./types";
import {SettingTab} from "./SettingTab";

export default class LanguageInjectorByTagPlugin extends Plugin {
    settings: DefaultLanguageSettings = DEFAULT_SETTINGS;

    async onload() {
        // 加载并合并配置
        this.settings = {...DEFAULT_SETTINGS, ...(await this.loadData())};

        // 添加设置项
        this.addSettingTab(new SettingTab(this.app, this));

        // 注册事件以监听文件修改
        this.registerEvent(this.app.vault.on('modify', this.handleFileModify.bind(this)));
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    private async handleFileModify(file: TAbstractFile) {
        // 非 md 文件直接跳过
        if (!(file instanceof TFile) || file.extension !== 'md') return;

        // 读取前置数据和文件内容
        const frontmatter = this.parseFrontMatter(file);
        const defaultLang = frontmatter?.[this.settings.customLanguageProperty] || '';

        // 无默认语言时直接返回，避免无效处理
        if (!defaultLang) return;

        const content = await this.app.vault.cachedRead(file);
        const newContent = this.updateCodeBlocks(content, defaultLang);

        if (newContent !== content) {
            await this.app.vault.modify(file, newContent);
        }
    }

    parseFrontMatter(file: TFile): Record<string, any> | null {
        const cache = this.app.metadataCache.getFileCache(file);
        return cache?.frontmatter || null;
    }

    updateCodeBlocks(content: string, defaultLanguage: string): string {
        // 正则表达式匹配代码块，捕获可选语言和代码内容
        const codeBlockRegex = /```([^\n]*?)\n([\s\S]*?)(?:\n)?```/g;

        return content.replace(codeBlockRegex, (match, language, code) => {
            const trimmedLanguage = language.trim();

            // 根据 isReplace 决定替换规则
            if (this.settings.isReplace) {
                return `\`\`\`${defaultLanguage}\n${code}\n\`\`\``;
            } else {
                return trimmedLanguage === ''
                    ? `\`\`\`${defaultLanguage}\n${code}\n\`\`\``
                    : match;
            }
        });
    }
}