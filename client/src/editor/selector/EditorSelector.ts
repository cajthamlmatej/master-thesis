import type {EditorBlock} from "@/editor/block/EditorBlock";
import type Editor from "@/editor/Editor";
import {EditorSelectorContext} from "@/editor/selector/EditorSelectorContext";
import EditorSelectorEvents from "@/editor/selector/EditorSelectorEvents";
import EditorSelectorArea from "@/editor/selector/area/EditorSelectorArea";
import {BlockEvent} from "@/editor/block/events/BlockEvent";


export class EditorSelector {
    public readonly events = new EditorSelectorEvents();
    private readonly editor: Editor;
    private readonly area: EditorSelectorArea;
    private selectedBlocks: EditorBlock[] = [];

    constructor(editor: Editor) {
        this.editor = editor;

        new EditorSelectorContext(this);
        this.area = new EditorSelectorArea(this);
        this.editor.events.MODE_CHANGED.on((mode) => {
            if (mode !== "select") {
                this.deselectAllBlocks();
            }
        });
    }

    public getEditor() {
        return this.editor;
    }

    public getArea() {
        return this.area;
    }

    /**
     * Deselects a block.
     * @param block to be deselected
     */
    public deselectBlock(block: EditorBlock) {
        this.selectedBlocks = this.selectedBlocks.filter(b => b !== block);
        block.processEvent(BlockEvent.DESELECTED);
        this.events.SELECTED_BLOCK_CHANGED.emit(this.selectedBlocks);
    }

    /**
     * Selects a block.
     * @param block to be selected
     * @param addToSelection if the block should be added to the current selection, otherwise the current selection will be cleared
     * @param event the event that will be passed to the block if it was already selected
     */
    public selectBlock(block: EditorBlock, addToSelection: boolean = false, event?: MouseEvent) {
        if (this.editor.getMode() !== "select") return;

        if (!addToSelection) {
            if (this.selectedBlocks.length === 1 && this.selectedBlocks[0] === block && event) {
                block.processEvent(BlockEvent.CLICKED, event);

                return
            }
        }

        if (block.group) {
            if (addToSelection) {
                // Add all with this group
                for (const b of this.editor.getBlocksInGroup(block.group)) {
                    if (!this.selectedBlocks.includes(b)) {
                        this.selectedBlocks.push(b);
                        b.processEvent(BlockEvent.SELECTED);
                    }
                }

                this.events.SELECTED_BLOCK_CHANGED.emit(this.selectedBlocks);
                return;
            }

            if (this.selectedBlocks.length == 0) {
                // Select all with this group
                for (const b of this.editor.getBlocksInGroup(block.group)) {
                    this.selectedBlocks.push(b);
                    b.processEvent(BlockEvent.SELECTED);
                }

                this.events.SELECTED_BLOCK_CHANGED.emit(this.selectedBlocks);
                return;
            }

            const allSelectedAreInGroup = this.selectedBlocks.every(b => b.group === block.group);
            const allInGroupAreSelected = this.editor.getBlocksInGroup(block.group).every(b => this.selectedBlocks.includes(b));

            if (allSelectedAreInGroup && allInGroupAreSelected) {
                // Deselect all with this group but not the clicked one
                for (const b of this.editor.getBlocksInGroup(block.group)) {
                    if (b !== block) {
                        this.deselectBlock(b);
                    }
                }

                this.events.SELECTED_BLOCK_CHANGED.emit(this.selectedBlocks);
                return;
            }


            this.deselectAllBlocks();
            for (const b of this.editor.getBlocksInGroup(block.group)) {
                this.selectedBlocks.push(b);
                b.processEvent(BlockEvent.SELECTED);
            }

            this.events.SELECTED_BLOCK_CHANGED.emit(this.selectedBlocks);

            return;
        }

        if (!addToSelection) {
            this.deselectAllBlocks();
        }

        if (this.selectedBlocks.includes(block)) {
            this.deselectBlock(block);
            return;
        }

        const editorSupport = block.editorSupport();

        if (!editorSupport.selection) {
            return;
        }

        block.processEvent(BlockEvent.SELECTED);
        this.selectedBlocks.push(block);
        this.events.SELECTED_BLOCK_CHANGED.emit(this.selectedBlocks);
    }

    /**
     * Checks if a block is selected.
     * @param block to check
     * @param soloOnly if is counted only if the block is the only selected block
     */
    public isSelected(block: EditorBlock, soloOnly: boolean = false) {
        if (soloOnly) {
            return this.selectedBlocks.length === 1 && this.selectedBlocks[0] === block;
        }

        return this.selectedBlocks.includes(block);
    }

    /**
     * Returns
     */
    public getSelectedBlocks() {
        return this.selectedBlocks;
    }

    /**
     * Deselects all blocks.
     */
    public deselectAllBlocks() {
        for (const block of this.selectedBlocks) {
            this.deselectBlock(block);
        }

        this.selectedBlocks = [];
    }
}
