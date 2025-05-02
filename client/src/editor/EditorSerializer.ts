import type Editor from "@/editor/Editor";
import {SlideData} from "@/models/Material";

/**
 * The EditorSerializer class is responsible for serializing the state of the editor
 * and its blocks into a format compatible with SlideData.
 */
export class EditorSerializer {
    private editor: Editor;

    /**
     * Constructs an instance of EditorSerializer.
     * @param editor - The editor instance to be serialized.
     */
    constructor(editor: Editor) {
        this.editor = editor;
    }

    /**
     * Serializes the editor and its blocks into a SlideData object.
     * @returns A SlideData object containing the serialized editor and blocks data.
     */
    serialize(): SlideData {
        const blocksObjects = this.editor.getBlocks().map(block => block.serialize());
        const editorData = this.editor.serialize();

        const data = {
            editor: editorData,
            blocks: blocksObjects
        };

        return data as SlideData;
    }
}
