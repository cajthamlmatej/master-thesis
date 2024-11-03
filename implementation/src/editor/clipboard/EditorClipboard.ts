import Editor from "@/editor/Editor";
import type {Block} from "@/editor/block/Block";

export class EditorClipboard {

    private editor: Editor;
    private clipboard: Block[] = [];

    constructor(editor: Editor) {
        this.editor = editor;
    }

    public markForCopy(blocks: Block[]) {
        this.clipboard = blocks;
    }

    public hasContent() {
        return this.clipboard.length > 0;
    }

    public paste() {
        const copiedBlocks = this.clipboard.map(b => b.clone());

        this.editor.getSelector().clearSelection();

        for (const block of copiedBlocks) {
            this.editor.addBlock(block);

            block.move(block.position.x + 20, block.position.y + 20);

            this.editor.getSelector().selectBlock(block, true);
        }
    }

}
