type ApiServicesBrowseResult = {
    success: boolean;
    filePath?: string;
    error?: string;
};

declare global {
    interface Window {
        apiServices?: {
            browseMapFile?: (opts?: { defaultPath?: string }) => Promise<ApiServicesBrowseResult>;
        };
    }
}

export async function browseMapFile(defaultPath?: string): Promise<ApiServicesBrowseResult> {
    const browse = window.apiServices?.browseMapFile;
    if (!browse) {
        return {
            success: false,
            error: "apiServices.browseMapFile is not available (IPC not wired)."
        };
    }

    return browse({ defaultPath });
}


