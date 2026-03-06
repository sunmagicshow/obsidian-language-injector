import {getLanguage} from 'obsidian';

export interface LangPack {
    settings: {
        languageProperty: string;
        isReplace: string;
    }
}

// 中文语言包
const zh: LangPack = {
    settings: {
        languageProperty: '属性名称',
        isReplace: '是否替换原代码标记',
    }
};

// 英文语言包
const en: LangPack = {
    settings: {
        languageProperty: 'Property Name',
        isReplace: 'Is replace original language marker',
    }
};


// 定义语言类型
type Locale = 'zh' | 'en';

// 语言包映射
const locales: Record<Locale, LangPack> = {zh, en};

// 获取系统语言
function getSystemLocale(): Locale {
    const language = getLanguage();
    return language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

export class I18nService {
    // 当前语言包实例
    public t: LangPack;

    constructor() {
        // 初始化时根据系统语言设置
        this.t = locales[getSystemLocale()];
    }
}

// 创建单例实例
export const i18n = new I18nService();