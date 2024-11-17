import Editor from "@/editor/Editor";
import type EditorPreferences from "@/editor/EditorPreferences";

export class EditorDeserializer {

    deserialize(data: string, element: HTMLElement, preferences?: EditorPreferences): Editor {
        const parsedData = JSON.parse(data);
        const editorData = parsedData.editor;
        const blocksData = parsedData.blocks;

        const editor = new Editor(element, editorData, preferences);

        for(let blockData of blocksData) {
            const block = editor.blockRegistry.deserialize(blockData);

            if (block) {
                editor.addBlock(block, false);
            }
        }

        return editor;

    }

}
