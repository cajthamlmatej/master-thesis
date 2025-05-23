export interface PluginReleaseDTO {
    version: string;
    date: string;
    changelog: string;
    manifest: string;
    editorCode: string;
    playerCode: string;
}

export interface PluginDTO {
    id: string;
    author: string;
    name: string;
    icon: string;
    description: string;
    tags: string[];
    releases: PluginReleaseDTO[];
}