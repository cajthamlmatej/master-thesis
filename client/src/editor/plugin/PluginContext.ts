import {EditorPlugin} from "@/editor/plugin/editor/EditorPlugin";
import Plugin, {PluginRelease} from "@/models/Plugin";
import Editor from "@/editor/Editor";
import Player from "@/editor/player/Player";
import {PlayerPlugin} from "@/editor/plugin/player/PlayerPlugin";

export class PluginContext {
    private id: string;
    private name: string;
    private manifestVersion: number;
    private author: string;
    private version: string;
    private icon: string;
    private allowedOrigins: string[] = [];

    private readonly editorPlugin: EditorPlugin | undefined;
    private readonly playerPlugin: PlayerPlugin | undefined;

    constructor(plugin: Plugin, release: PluginRelease, editor?: Editor, player?: Player) {
        this.parseManifest(release.manifest);
        this.author = plugin.author;
        this.name = plugin.name;
        this.version = release.version;
        this.icon = plugin.icon;
        this.id = plugin.id;

        if(release.editorCode) {
            this.editorPlugin = new EditorPlugin(this, release.editorCode, editor);
        } else {
            this.log("No editor code found, skipping editor plugin creation");
        }
        if(release.playerCode) {
            this.playerPlugin = new PlayerPlugin(this, release.playerCode, player);
        } else {
            this.log("No player code found, skipping player plugin creation");
        }
    }

    public getEditorPlugin() {
        return this.editorPlugin;
    }
    public getPlayerPlugin() {
        return this.playerPlugin;
    }

    private parseManifest(manifest: string) {
        const manifestData = JSON.parse(manifest);

        switch(manifestData.manifest ?? -1) {
            case 1: {
                this.manifestVersion = 1;
                this.allowedOrigins = manifestData.allowedOrigins ?? [];
                break;
            }
            default: {
                throw new Error("Invalid plugin manifest version");
            }
        }
    }

    public canExecuteOnUrl(url: string) {
        if(["file://", "http://", "about:", "chrome:", "chrome-extension:"].some(domain => url.startsWith(domain))) {
            return false;
        }

        try {
            const urlObj = new URL(url);
            return this.allowedOrigins.includes(urlObj.origin);
        } catch(e) {
            return false;
        }
    }

    public log(message: string, fromScript: boolean = false) {
        const prefix = `[Plugin ${this.getName()}] `;
        if(fromScript) {
            console.log(`${prefix}[Script] %c${message}`, "color: #bada55; background: #222; padding: 2px 4px; border-radius: 4px;");
        } else {
            console.log(`${prefix}%c${message}`, "");
        }
    }

    public getName() {
        return this.name;
    }

    public toString() {
        return this.name + " (v"+this.version+")";
    }

    public getIcon() {
        return this.icon;
    }

    public getVersion() {
        return this.version;
    }

    public getId() {
        return this.id;
    }

    public getAuthor() {
        return this.author;
    }
}
