import {EditorPlugin} from "@/editor/plugin/editor/EditorPlugin";
import Plugin, {PluginRelease} from "@/models/Plugin";
import Editor from "@/editor/Editor";
import Player from "@/editor/player/Player";
import {PlayerPlugin} from "@/editor/plugin/player/PlayerPlugin";

/**
 * Represents the context of a plugin, managing its metadata, permissions, and associated editor/player plugins.
 */
export class PluginContext {
    /**
     * A promise that resolves when the plugin is fully loaded.
     */
    public loaded: Promise<void>;
    private id: string;
    private name: string;
    private manifestVersion: number;
    private author: string;
    private version: string;
    private icon: string;
    private allowedOrigins: string[] = [];
    private readonly editorPlugin: EditorPlugin | undefined;
    private readonly playerPlugin: PlayerPlugin | undefined;

    /**
     * Initializes a new instance of the PluginContext class.
     * @param plugin The plugin metadata.
     * @param release The plugin release details.
     * @param editor The editor instance (optional).
     * @param player The player instance (optional).
     */
    constructor(plugin: Plugin, release: PluginRelease, editor?: Editor, player?: Player) {
        this.parseManifest(release.manifest);
        this.author = plugin.author;
        this.name = plugin.name;
        this.version = release.version;
        this.icon = plugin.icon;
        this.id = plugin.id;

        //console.log(editor, player);

        if (release.editorCode && editor) {
            this.editorPlugin = new EditorPlugin(this, release.editorCode, editor);
        } else {
            this.log("No editor code or editor itself found, skipping editor plugin creation");
        }
        if (release.playerCode && player) {
            this.playerPlugin = new PlayerPlugin(this, release.playerCode, player);
        } else {
            this.log("No player code or player itself found, skipping player plugin creation");
        }

        //console.log(this.playerPlugin, this.editorPlugin);

        this.loaded = Promise.all([this.playerPlugin?.loadedPromise, this.editorPlugin?.loadedPromise].filter(a => a)).then();
    }

    /**
     * Gets the editor plugin associated with this context.
     * @returns The editor plugin instance, or undefined if not available.
     */
    public getEditorPlugin() {
        return this.editorPlugin;
    }

    /**
     * Gets the player plugin associated with this context.
     * @returns The player plugin instance, or undefined if not available.
     */
    public getPlayerPlugin() {
        return this.playerPlugin;
    }

    /**
     * Gets the manifest version of the plugin.
     * @returns The manifest version.
     */
    public getManifestVersion() {
        return this.manifestVersion;
    }

    /**
     * Determines whether the plugin can execute on the specified URL.
     * @param url The URL to check.
     * @returns True if the plugin can execute on the URL, otherwise false.
     */
    public canExecuteOnUrl(url: string) {
        if (["file://", "http://", "about:", "chrome:", "chrome-extension:"].some(domain => url.startsWith(domain))) {
            return false;
        }

        try {
            const urlObj = new URL(url);
            return this.allowedOrigins.includes(urlObj.origin);
        } catch (e) {
            return false;
        }
    }

    /**
     * Logs a message to the console with a plugin-specific prefix.
     * @param message The message to log.
     * @param fromScript Indicates if the message is from a script (optional).
     */
    public log(message: string, fromScript: boolean = false) {
        const prefix = `[Plugin ${this.getName()}] `;
        if (fromScript) {
            console.log(`${prefix}[Script] %c${message}`, "color: #bada55; background: #222; padding: 2px 4px; border-radius: 4px;");
        } else {
            console.log(`${prefix}%c${message}`, "");
        }
    }

    /**
     * Gets the name of the plugin.
     * @returns The plugin name.
     */
    public getName() {
        return this.name;
    }

    /**
     * Converts the plugin context to a string representation.
     * @returns A string containing the plugin name and version.
     */
    public toString() {
        return this.name + " (v" + this.version + ")";
    }

    /**
     * Gets the icon of the plugin.
     * @returns The plugin icon.
     */
    public getIcon() {
        return this.icon;
    }

    /**
     * Gets the version of the plugin.
     * @returns The plugin version.
     */
    public getVersion() {
        return this.version;
    }

    /**
     * Gets the unique identifier of the plugin.
     * @returns The plugin ID.
     */
    public getId() {
        return this.id;
    }

    /**
     * Gets the author of the plugin.
     * @returns The plugin author.
     */
    public getAuthor() {
        return this.author;
    }

    /**
     * Parses the plugin manifest and extracts relevant data.
     * @param manifest The manifest JSON string.
     * @throws An error if the manifest version is invalid.
     */
    private parseManifest(manifest: string) {
        const manifestData = JSON.parse(manifest);

        switch (manifestData.manifest ?? -1) {
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
}
