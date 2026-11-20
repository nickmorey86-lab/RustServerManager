type serverMessagesAPI = {
    ChatMessages: {
        load: () => Promise<ChatMessages | null>;
        save: (settings: ChatMessages) => Promise<{ success: boolean; error?: string }>;
    };
};

type ChatMessages = {
    enable: boolean;
    sayWhat: string;
    everyMins: number;
}

declare global {
    interface Window extends Partial<serverMessagesAPI> {
        ChatMessages?: serverMessagesAPI["ChatMessages"];
    }
}

function getChatMessagesBridge() {
    const bridge = window.ChatMessages;

    if (!bridge) {
        throw new Error(
            "ChatMessages API is not available. Ensure electron preload exposes window.CombinedAdminWhitelist."
        );
    }
    return bridge;
}

export async function loadChatMessages(): Promise<ChatMessages> {
    const bridge = getChatMessagesBridge();
    const loaded = await bridge.load();
    return (
        loaded ?? {
            enable: true,
            sayWhat: "",
            everyMins: 0,
        }
    );
}
export async function saveChatMessages(settings: ChatMessages) {
    const bridge = getChatMessagesBridge();
    return bridge.save(settings);
}