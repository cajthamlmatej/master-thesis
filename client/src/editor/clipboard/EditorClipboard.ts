import Editor from "@/editor/Editor";
import type {EditorBlock} from "@/editor/block/EditorBlock";
import {BlockRegistry} from "@/editor/block/BlockRegistry";
import {generateUUID} from "@/utils/Generators";

/**
 * Manages clipboard functionality for the editor, allowing blocks to be copied, pasted, and cleared.
 * Synchronizes clipboard data with localStorage and listens for storage events.
 */
export class EditorClipboard {
    private readonly key;
    private editor: Editor;
    // Contains serialized blocks
    private clipboard: Object[] = [];

    /**
     * Initializes the EditorClipboard instance.
     * @param editor - The editor instance this clipboard is associated with.
     * @param key - The localStorage key used to store clipboard data.
     */
    constructor(editor: Editor, key: string = "EDITOR_CLIPBOARD") {
        this.editor = editor;
        this.key = key;

        this.clipboard = JSON.parse(localStorage.getItem(this.key) || "[]") || [];

        window.addEventListener("storage", this.storageEvent.bind(this));
    }

    /**
     * Serializes and stores the provided blocks in the clipboard.
     * @param blocks - The blocks to be copied to the clipboard.
     */
    public markForCopy(blocks: EditorBlock[]) {
        this.clipboard = this.serializeBlocks(blocks);

        localStorage.setItem(this.key, JSON.stringify(this.clipboard));
    }

    /**
     * Checks if the clipboard contains any content.
     * @returns True if the clipboard has content, false otherwise.
     */
    public hasContent() {
        return this.clipboard.length > 0;
    }

    /**
     * Pastes the blocks from the clipboard into the editor at the specified position.
     * If no position is provided, calculates a default target position.
     * @param position - The position where the blocks should be pasted.
     */
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

    /**
     * Clears the clipboard content.
     */
    public clear() {
        this.clipboard = [];
    }

    /**
     * Handles storage events to synchronize clipboard data across browser tabs.
     * @param event - The storage event triggered when localStorage changes.
     */
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

    /**
     * Serializes the provided blocks for storage in the clipboard.
     * Updates group IDs for grouped blocks to ensure uniqueness.
     * @param blocks - The blocks to be serialized.
     * @returns An array of serialized block objects.
     */
    private serializeBlocks(blocks: EditorBlock[]) {
        const clonedBlocks = blocks.map(b => b.clone());

        let mapper: Record<string, string> = {};

        for (let cloned of clonedBlocks) {
            if (!cloned.group) continue;

            let newGroup = mapper[cloned.group];

            if (!newGroup) {
                newGroup = generateUUID();
                mapper[cloned.group] = newGroup;
            }

            cloned.group = newGroup;
        }

        return clonedBlocks.map(b => b.serialize());
    }

    /**
     * Deserializes the blocks from the clipboard into EditorBlock instances.
     * @param blocks - The serialized blocks to be deserialized.
     * @returns An array of deserialized and cloned EditorBlock instances.
     */
    private deserializeBlocks(blocks: any[]) {
        const deserializer = new BlockRegistry(); // TODO: unify with others which use BlockRegistry
        return blocks.map(b => deserializer.deserializeEditor(b)).filter(b => b !== undefined).map(block => block.clone())
    }

    /**
     * Calculates the target position for pasting blocks.
     * If blocks are selected, uses the center of the selection area; otherwise, uses the top-left block's position.
     * @param blocks - The blocks to be pasted.
     * @returns The calculated target position.
     */
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

    /**
     * Calculates the relative offset for each block based on the center of the pasted blocks.
     * @param blocks - The blocks to be pasted.
     * @returns An array of objects containing the relative offsets and the blocks.
     */
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
