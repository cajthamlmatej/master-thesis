import type {EditorBlock} from "@/editor/block/EditorBlock";
import type Editor from "@/editor/Editor";
import {EditorSelectorContext} from "@/editor/selector/EditorSelectorContext";
import EditorSelectorEvents from "@/editor/selector/EditorSelectorEvents";
import EditorSelectorArea from "@/editor/selector/area/EditorSelectorArea";
import {BlockEvent} from "@/editor/block/events/BlockEvent";
import {communicator} from "@/api/websockets";

/**
 * Manages block selection and related interactions in the editor.
 * Handles selecting, deselecting, and querying selected blocks,
 * as well as managing selection-related events and contexts.
 */
export class EditorSelector {
    public readonly events = new EditorSelectorEvents();
    private readonly editor: Editor;
    private readonly area: EditorSelectorArea;
    private readonly context: EditorSelectorContext;
    private selectedBlocks: EditorBlock[] = [];

    /**
     * Initializes the EditorSelector.
     * @param editor The editor instance this selector belongs to.
     */
    constructor(editor: Editor) {
        this.editor = editor;

        this.context = new EditorSelectorContext(this);
        this.area = new EditorSelectorArea(this);
        this.editor.events.MODE_CHANGED.on((mode) => {
            if (mode !== "select") {
                this.deselectAllBlocks();
            }
        });
    }

    /**
     * Returns the editor instance associated with this selector.
     */
    public getEditor() {
        return this.editor;
    }

    /**
     * Returns the context associated with this selector.
     */
    public getContext() {
        return this.context;
    }

    /**
     * Returns the selection area associated with this selector.
     */
    public getArea() {
        return this.area;
    }

    /**
     * Deselects a block.
     * @param block The block to be deselected, identified by its instance or ID.
     * @param skipAnnouncement Whether to skip emitting a deselection event.
     */
    public deselectBlock(block: EditorBlock | string, skipAnnouncement: boolean = false) {
        if (typeof block === "string") {
            let blockData = this.editor.getBlockById(block);

            if (!blockData) {
                return;
            }

            block = blockData;
        }

        this.selectedBlocks = this.selectedBlocks.filter(b => b !== block);
        block.processEvent(BlockEvent.DESELECTED);
        this.events.SELECTED_BLOCK_CHANGED.emit(this.selectedBlocks);

        if (!skipAnnouncement) {
            this.editor.events.BLOCK_CONTENT_CHANGED.emit(block);
        }
    }

    /**
     * Selects a block.
     * @param block The block to be selected, identified by its instance or ID.
     * @param addToSelection Whether to add the block to the current selection.
     * @param event The event triggering the selection, if applicable.
     */
    public selectBlock(block: EditorBlock | string, addToSelection: boolean = false, event?: MouseEvent) {
        if (this.editor.getMode() !== "select") return;

        if (typeof block === "string") {
            let blockData = this.editor.getBlockById(block);

            if (!blockData) {
                return;
            }

            block = blockData;
        }

        const room = communicator.getEditorRoom();
        if (room) {
            if (!room.canSelectBlock(block.id)) {
                return;
            }

            const inGroup = this.editor.getBlocks().filter(b => !!b.group).filter(b => b.group === block.group).map(b => b.id);

            if (!inGroup.every(id => room.canSelectBlock(id))) {
                return;
            }
        }

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
     * @param block The block to check, identified by its instance or ID.
     * @param soloOnly Whether to check if the block is the only selected block.
     */
    public isSelected(block: EditorBlock | string, soloOnly: boolean = false) {
        if (typeof block === "string") {
            let blockData = this.editor.getBlockById(block);

            if (!blockData) {
                return false;
            }

            block = blockData;
        }

        if (soloOnly) {
            return this.selectedBlocks.length === 1 && this.selectedBlocks[0] === block;
        }

        return this.selectedBlocks.includes(block);
    }

    /**
     * Returns the currently selected blocks.
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
