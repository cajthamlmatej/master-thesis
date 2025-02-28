import {BlockRenderer} from "@/editor/BlockRenderer";
import {EditorBlock} from "@/editor/block/EditorBlock";
import {PluginEditorBlock} from "@/editor/block/base/plugin/PluginEditorBlock";
import {PluginManager} from "@/editor/plugin/PluginManager";
import {toRaw} from "vue";

export class EditorBlockRenderer extends BlockRenderer<EditorBlock> {
    private pluginManager: PluginManager;


    constructor(pluginManager: PluginManager) {
        super();
        this.pluginManager = pluginManager;
    }

    async render(block: EditorBlock): Promise<string> {
        if(!(block instanceof PluginEditorBlock)) {
            console.error("[EditorBlockRenderer] Block is not an instance of PluginEditorBlock and cannot be rendered.");
            return "";
        }

        const pluginId = block.getPlugin();
        const plugin = this.pluginManager.getPlugin(pluginId);

        if(!plugin) {
            console.error("[EditorBlockRenderer] Plugin with ID " + pluginId + " not found.");
            return "";
        }

        const editorPlugin = toRaw(plugin.getEditorPlugin());

        if(!editorPlugin) {
            console.error("[EditorBlockRenderer] Plugin with ID " + pluginId + " has no editor plugin.");
            return "";
        }

        return await editorPlugin.renderBlock(block);
    }
}
