import Editor from "@/editor/Editor";
import type {EditorBlock} from "@/editor/block/EditorBlock";
import {BlockRegistry} from "@/editor/block/BlockRegistry";
import {generateUUID} from "@/utils/Generators";

export class EditorClipboard {
    private readonly key;
    private editor: Editor;
    // Contains serialized blocks
    private clipboard: Object[] = [];

    constructor(editor: Editor, key: string = "EDITOR_CLIPBOARD") {
        this.editor = editor;
        this.key = key;

        this.clipboard = JSON.parse(localStorage.getItem(this.key) || "[]") || [];

        window.addEventListener("storage", this.storageEvent.bind(this));
    }

    public markForCopy(blocks: EditorBlock[]) {
        this.clipboard = this.serializeBlocks(blocks);

        localStorage.setItem(this.key, JSON.stringify(this.clipboard));
    }

    public hasContent() {
        return this.clipboard.length > 0;
    }

    public paste(position: { x: number, y: number } | undefined = undefined) {
        if (!this.hasContent()) return;

        let blocks = this.deserializeBlocks(this.clipboard);

        if (!position) {
            position = this.getTargetPosition(blocks);
        }

        const distances = this.getPastePositionWithRelativeOffset(blocks);

        this.editor.getSelector().deselectAllBlocks();

        for (const {diffX, diffY, block} of distances) {
            this.editor.addBlock(block);

            block.move(position.x + diffX, position.y + diffY);

            this.editor.getSelector().selectBlock(block, true);
        }
    }

    public clear() {
        this.clipboard = [];
    }

    private storageEvent(event: StorageEvent) {
        if (event.storageArea !== localStorage) {
            return;
        }

        if (event.key !== this.key) {
            return;
        }

        if (!event.newValue) {
            return;
        }

        this.clipboard = JSON.parse(event.newValue);
    }

    private serializeBlocks(blocks: EditorBlock[]) {
        const clonedBlocks = blocks.map(b => b.clone());

        let mapper: Record<string, string> = {};

        for(let cloned of clonedBlocks) {
            if(!cloned.group) continue;

            let newGroup = mapper[cloned.group];

            if(!newGroup) {
                newGroup = generateUUID();
                mapper[cloned.group] = newGroup;
            }

            cloned.group = newGroup;
        }

        return clonedBlocks.map(b => b.serialize());
    }

    private deserializeBlocks(blocks: any[]) {
        const deserializer = new BlockRegistry(); // TODO: unify with others which use BlockRegistry
        return blocks.map(b => deserializer.deserializeEditor(b)).filter(b => b !== undefined).map(block => block.clone())
    }

    private getTargetPosition(blocks: EditorBlock[]) {
        let position;

        if (this.editor.getSelector().getSelectedBlocks().length > 0) {
            const area = this.editor.getSelector().getArea().getArea();

            position = {
                x: area.x + area.width / 2,
                y: area.y + area.height / 2,
            }
        } else {
            const leftTopBlock = blocks.reduce((prev, curr) => {
                if (curr.position.x < prev.position.x || curr.position.y < prev.position.y) {
                    return curr;
                } else {
                    return prev;
                }
            }, blocks[0]);
            position = leftTopBlock.position;
        }

        return position;
    }

    private getPastePositionWithRelativeOffset(blocks: EditorBlock[]) {
        const minX = blocks.reduce((prev, curr) => Math.min(prev, curr.position.x), blocks[0].position.x);
        const minY = blocks.reduce((prev, curr) => Math.min(prev, curr.position.y), blocks[0].position.y);
        const maxX = blocks.reduce((prev, curr) => Math.max(prev, curr.position.x + curr.size.width), blocks[0].position.x + blocks[0].size.width);
        const maxY = blocks.reduce((prev, curr) => Math.max(prev, curr.position.y + curr.size.height), blocks[0].position.y + blocks[0].size.height);

        const center = {
            x: minX + (maxX - minX) / 2,
            y: minY + (maxY - minY) / 2,
        };

        return blocks.map(b => {
            return {
                diffX: b.position.x - center.x,
                diffY: b.position.y - center.y,
                block: b,
            }
        });
    }
}
