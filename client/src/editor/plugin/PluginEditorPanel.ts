import {PluginContext} from "@/editor/plugin/PluginContext";

/**
 * Represents an editor panel provided by a plugin.
 */
export interface PluginEditorPanel {
    /**
     * The plugin context associated with this panel.
     */
    plugin: PluginContext;

    /**
     * The name of the panel.
     */
    name: string;

    /**
     * The content of the panel, typically HTML or a Vue component.
     */
    content: string;

    /**
     * The icon representing the panel.
     */
    icon: string;
}
