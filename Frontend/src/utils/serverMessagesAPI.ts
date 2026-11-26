type ServerMessagesAPI = {
    serverMessages: {
        load: () => Promise<ServerMessage[]>;
        save: (
            settings: ServerMessage[]
        ) => Promise<{ success: boolean; error?: string }>;
    };
};

export type ServerMessage = {
    id: string;
    enable: boolean;
    sayWhat: string;
    everyMins: number;
};

declare global {
    interface Window extends Partial<ServerMessagesAPI> {
        serverMessages?: ServerMessagesAPI["serverMessages"];
    }
}

function getServerMessagesBridge() {
    const bridge = window.serverMessages;

    if (!bridge) {
        throw new Error(
            "serverMessages API is not available. Ensure electron preload exposes window.serverMessages."
        );
    }
    return bridge;
}

export async function loadServerMessages(): Promise<ServerMessage[]> {
    const bridge = getServerMessagesBridge();
    const loaded = await bridge.load();

    return loaded ?? [];
}
export async function saveServerMessages(settings: ServerMessage[]) {
    const bridge = getServerMessagesBridge();
    return bridge.save(settings);
}