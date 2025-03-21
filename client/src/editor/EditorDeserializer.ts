import Editor from "@/editor/Editor";
import type EditorPreferences from "@/editor/EditorPreferences";
import {EditorPluginCommunicator} from "@/editor/EditorPluginCommunicator";
import {SlideData} from "@/models/Material";

export class EditorDeserializer {

    deserialize(data: SlideData, element: HTMLElement, preferences?: EditorPreferences, communicator?: EditorPluginCommunicator): Editor {
        const editorData = data.editor;
        const blocksData = data.blocks;

        const editor = new Editor(element, editorData, preferences);

        if (communicator) {
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
