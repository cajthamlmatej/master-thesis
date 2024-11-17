import type Editor from "@/editor/Editor";

export class EditorSerializer {
    private editor: Editor;

    constructor(editor: Editor) {
        this.editor = editor;
    }

    serialize(): string {
        const blocksObjects = this.editor.getBlocks().map(block => block.serialize());
        const editorData = this.editor.serialize();

        const data = {
            editor: editorData,
            blocks: blocksObjects
        };

        return JSON.stringify(data);
    }

}
