"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => LanguageInjectorByTagPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian3 = require("obsidian");

// src/types.ts
var DEFAULT_SETTINGS = {
  customLanguageProperty: "code",
  isReplace: false
};

// src/SettingTab.ts
var import_obsidian2 = require("obsidian");

// src/i18n.ts
var import_obsidian = require("obsidian");
var zh = {
  settings: {
    languageProperty: "\u8BED\u8A00\u6807\u8BB0",
    isReplace: "\u662F\u5426\u66FF\u6362\u539F\u6807\u8BB0"
  }
};
var en = {
  settings: {
    languageProperty: "Language Tag",
    isReplace: "Is replace original"
  }
};
var locales = { zh, en };
function getSystemLocale() {
  const language = (0, import_obsidian.getLanguage)();
  return language.toLowerCase().startsWith("zh") ? "zh" : "en";
}
var I18nService = class {
  constructor() {
    this.t = locales[getSystemLocale()];
  }
};
var i18n = new I18nService();

// src/SettingTab.ts
var SettingTab = class extends import_obsidian2.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian2.Setting(this.containerEl).setName(i18n.t.settings.languageProperty).addText(
      (text) => text.setPlaceholder("code").setValue(this.plugin.settings.customLanguageProperty).onChange(async (value) => {
        this.plugin.settings.customLanguageProperty = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian2.Setting(containerEl).setName(i18n.t.settings.isReplace).addToggle((toggle) => {
      return toggle.setValue(this.plugin.settings.isReplace).onChange(async (value) => {
        this.plugin.settings.isReplace = value;
        await this.plugin.saveSettings();
      });
    });
  }
};

// src/main.ts
var LanguageInjectorByTagPlugin = class extends import_obsidian3.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
  }
  async onload() {
    this.settings = { ...DEFAULT_SETTINGS, ...await this.loadData() };
    this.addSettingTab(new SettingTab(this.app, this));
    this.registerEvent(this.app.vault.on("modify", this.handleFileModify.bind(this)));
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  async handleFileModify(file) {
    if (!(file instanceof import_obsidian3.TFile) || file.extension !== "md") return;
    const frontmatter = this.parseFrontMatter(file);
    const defaultLang = (frontmatter == null ? void 0 : frontmatter[this.settings.customLanguageProperty]) || "";
    if (!defaultLang) return;
    const content = await this.app.vault.cachedRead(file);
    const newContent = this.updateCodeBlocks(content, defaultLang);
    if (newContent !== content) {
      await this.app.vault.modify(file, newContent);
    }
  }
  parseFrontMatter(file) {
    const cache = this.app.metadataCache.getFileCache(file);
    return (cache == null ? void 0 : cache.frontmatter) || null;
  }
  updateCodeBlocks(content, defaultLanguage) {
    const codeBlockRegex = /```([^\n]*?)\n([\s\S]*?)(?:\n)?```/g;
    return content.replace(codeBlockRegex, (match, language, code) => {
      const trimmedLanguage = language.trim();
      if (this.settings.isReplace) {
        return `\`\`\`${defaultLanguage}
${code}
\`\`\``;
      } else {
        return trimmedLanguage === "" ? `\`\`\`${defaultLanguage}
${code}
\`\`\`` : match;
      }
    });
  }
};
//# sourceMappingURL=main.js.map
