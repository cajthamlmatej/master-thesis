import Editor from "@/editor/Editor";
import type EditorPreferences from "@/editor/EditorPreferences";
import {EditorPluginCommunicator} from "@/editor/EditorPluginCommunicator";
import {SlideData} from "@/models/Material";
import { usePluginStore } from "@/stores/plugin";
import { toRaw } from "vue";
import { PluginManager } from "./plugin/PluginManager";

export class EditorDeserializer {

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
