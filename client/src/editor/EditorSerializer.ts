import type Editor from "@/editor/Editor";
import {SlideData} from "@/models/Material";

export class EditorSerializer {
    private editor: Editor;

    constructor(editor: Editor) {
        this.editor = editor;
    }

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
