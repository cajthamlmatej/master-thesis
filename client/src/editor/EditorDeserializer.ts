import Editor from "@/editor/Editor";
import type EditorPreferences from "@/editor/EditorPreferences";
import {PlayerPluginCommunicator} from "@/editor/player/PlayerPluginCommunicator";
import {EditorPluginCommunicator} from "@/editor/EditorPluginCommunicator";

export class EditorDeserializer {

    deserialize(data: string, element: HTMLElement, preferences?: EditorPreferences, communicator?: EditorPluginCommunicator): Editor {
        const parsedData = JSON.parse(data);
        const editorData = parsedData.editor;
        const blocksData = parsedData.blocks;

        const editor = new Editor(element, editorData, preferences);

        if(communicator) {
            editor.setPluginCommunicator(communicator);
        }

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
