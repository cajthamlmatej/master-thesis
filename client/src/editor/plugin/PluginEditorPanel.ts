import {PluginContext} from "@/editor/plugin/PluginContext";

export interface PluginEditorPanel {
    plugin: PluginContext;
    name: string;
    content: string;
    icon: string;
}
