
// 定义配置接口
export interface DefaultLanguageSettings {
    customLanguageProperty: string;
    isReplace: boolean;
}

// 定义W默认设置
export const DEFAULT_SETTINGS: DefaultLanguageSettings = {
    customLanguageProperty: 'language',
    isReplace: false ,
};

