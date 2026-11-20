import type { AntiChatSpamRule } from "../pages/settings/settingsTabs/general/bulkSettings/generalSubPages/chatRules/antiChatSpamRules/ruleTypes";

type WindowRulesAPI = {
    rules: {
        loadAll: () => Promise<unknown[]>;
        save: (rule: unknown) => Promise<{ success: boolean; fileName?: string; error?: string }>;
        delete: (fileName: string) => Promise<{ success: boolean; error?: string }>;
    };
};

declare global {
    interface Window extends WindowRulesAPI { }
}

export async function loadAntiChatSpamRules(): Promise<AntiChatSpamRule[]> {
    try {
        const raw = await window.rules.loadAll();
        return (raw ?? []) as AntiChatSpamRule[];
    } catch {
        return [];
    }
}

export async function saveAntiChatSpamRule(rule: AntiChatSpamRule) {
    return window.rules.save(rule);
}


