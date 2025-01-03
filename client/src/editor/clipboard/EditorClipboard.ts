import Editor from "@/editor/Editor";
import type {EditorBlock} from "@/editor/block/EditorBlock";

export class EditorClipboard {

    private editor: Editor;
    private clipboard: EditorBlock[] = [];

    constructor(editor: Editor) {
        this.editor = editor;
    }

    public markForCopy(blocks: EditorBlock[]) {
        this.clipboard = blocks;
    }

    public hasContent() {
        return this.clipboard.length > 0;
    }

    public paste(position: { x: number, y: number } | undefined = undefined) {
        if (!position) {
            if (this.editor.getSelector().getSelectedBlocks().length > 0) {
                const area = this.editor.getSelector().getArea().getArea();

                position = {
                    x: area.x + area.width / 2,
                    y: area.y + area.height / 2,
                } // TODO: rotation?
            } else {
                const leftTopBlock = this.clipboard.reduce((prev, curr) => {
                    if (curr.position.x < prev.position.x || curr.position.y < prev.position.y) {
                        return curr;
                    } else {
                        return prev;
                    }
                }, this.clipboard[0]);
                position = leftTopBlock.position;
            }
        }

        this.editor.getSelector().deselectAllBlocks();

        const minX = this.clipboard.reduce((prev, curr) => Math.min(prev, curr.position.x), this.clipboard[0].position.x);
        const minY = this.clipboard.reduce((prev, curr) => Math.min(prev, curr.position.y), this.clipboard[0].position.y);
        const maxX = this.clipboard.reduce((prev, curr) => Math.max(prev, curr.position.x + curr.size.width), this.clipboard[0].position.x + this.clipboard[0].size.width);
        const maxY = this.clipboard.reduce((prev, curr) => Math.max(prev, curr.position.y + curr.size.height), this.clipboard[0].position.y + this.clipboard[0].size.height);

        const center = {
            x: minX + (maxX - minX) / 2,
            y: minY + (maxY - minY) / 2,
        };

        const copiedBlocks = this.clipboard.map(b => b.clone());

        const distances = copiedBlocks.map(b => {
            return {
                diffX: b.position.x - center.x,
                diffY: b.position.y - center.y,
                block: b,
            }
        });

        this.editor.debugPoint(position.x, position.y, "purple");

        for (const {diffX, diffY, block} of distances) {
            this.editor.addBlock(block);

            block.move(position.x + diffX, position.y + diffY);

            this.editor.getSelector().selectBlock(block, true);
        }
    }

    public clear() {
        this.clipboard = [];
    }
}
