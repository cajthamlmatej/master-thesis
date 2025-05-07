import Editor from "@/editor/Editor";
import {EditorBlock} from "@/editor/block/EditorBlock";

/**
 * Represents the state of the editor, including its configuration and blocks.
 */
export class EditorState {

    public editor: Object = {};
    public blocks: Object[] = [];

}

/**
 * Manages the undo/redo history for the editor.
 */
export class EditorHistory {

    private editor: Editor;
    private forwardStack: EditorState[] = [];
    private backwardStack: EditorState[] = [];

    /**
     * Initializes the EditorHistory with the given editor instance.
     * @param editor The editor instance to associate with this history manager.
     */
    constructor(editor: Editor) {
        this.editor = editor;

        editor.events.HISTORY.on(() => {
            this.saveState();
        });
    }

    /**
     * Saves the current state of the editor to the history stack.
     */
    public saveState() {
        const state = new EditorState();

        state.editor = this.editor.serialize();
        state.blocks = this.editor.getBlocks().map((block: EditorBlock) => block.serialize());

        this.forwardStack.push(state);

        if (this.forwardStack.length > this.editor.getPreferences().HISTORY_LIMIT) {
            this.forwardStack.shift();
        }

        this.backwardStack = [];
    }

    /**
     * Applies a given editor state, restoring the editor to that state.
     * @param state The editor state to apply.
     */
    public applyState(state: EditorState) {
        const editor = state.editor as {
            size: { width: number; height: number; }
        };
        this.editor.clearBlocks();
        this.editor.resize(editor.size.width, editor.size.height, false);

        for (let block of state.blocks) {
            const newBlock = this.editor.blockRegistry.deserializeEditor(block);

            if (!newBlock) {
                continue;
            }

            this.editor.addBlock(newBlock, false);
        }

        this.editor.events.HISTORY_JUMP.emit();
    }

    /**
     * Undoes the last action by restoring the previous editor state.
     */
    public undo() {
        if (this.forwardStack.length === 0) {
            return;
        }

        let state = this.forwardStack.pop()!;

        if (this.backwardStack.length === 0) {
            state = this.forwardStack.pop()!;

            if (!state) {
                return;
            }
        }

        this.backwardStack.push(state);
        this.applyState(state);
    }

    /**
     * Redoes the last undone action by restoring the next editor state.
     */
    public redo() {
        if (this.backwardStack.length === 0) {
            return;
        }

        const state = this.backwardStack.pop();

        if (!state) {
            return;
        }

        this.forwardStack.push(state);
        this.applyState(state);
    }

    /**
     * Checks if there are states available to redo.
     * @returns True if redo is possible, false otherwise.
     */
    canRedo() {
        return this.backwardStack.length > 0;
    }

    /**
     * Checks if there are states available to undo.
     * @returns True if undo is possible, false otherwise.
     */
    canUndo() {
        return this.forwardStack.length > 0;
    }
}
