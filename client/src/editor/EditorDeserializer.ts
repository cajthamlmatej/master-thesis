import Editor from "@/editor/Editor";
import type EditorPreferences from "@/editor/EditorPreferences";
import {EditorPluginCommunicator} from "@/editor/EditorPluginCommunicator";
import {SlideData} from "@/models/Material";
import {usePluginStore} from "@/stores/plugin";
import {PluginManager} from "./plugin/PluginManager";

/**
 * The EditorDeserializer class is responsible for deserializing slide data into an Editor instance.
 * It initializes the editor, loads plugins, and adds blocks to the editor based on the provided data.
 */
export class EditorDeserializer {

    /**
     * Deserializes slide data into an Editor instance.
     * 
     * @param data - The slide data containing editor and block information.
     * @param element - The HTML element where the editor will be rendered.
     * @param preferences - Optional editor preferences to customize the editor behavior.
     * @returns A promise that resolves to the initialized Editor instance.
     */
    async deserialize(data: SlideData, element: HTMLElement, preferences?: EditorPreferences) {
        const editorData = data.editor;
        const blocksData = data.blocks;

        const editor = new Editor(element, editorData, preferences);

        const pluginStore = usePluginStore();
        await pluginStore.loadPlugins(editor);

        //console.log((pluginStore.manager);

        editor.setPluginCommunicator(new EditorPluginCommunicator(pluginStore.manager as PluginManager));

        for (let blockData of blocksData) {
            const block = editor.blockRegistry.deserializeEditor(blockData);

            if (block) {
                editor.addBlock(block, false);
            }
        }
        editor.events.HISTORY.emit();

        return editor;

    }

}
