import Editor from "@/editor/Editor";
import {EditorBlock} from "@/editor/block/EditorBlock";

export class EditorState {

    public editor: Object = {};
    public blocks: Object[] = [];

}

export class EditorHistory {

    private editor: Editor;
    private forwardStack: EditorState[] = [];
    private backwardStack: EditorState[] = [];

    constructor(editor: Editor) {
        this.editor = editor;

        editor.events.HISTORY.on(() => {
            this.saveState();
        });
    }

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

    public undo() {
        if (this.forwardStack.length === 0) {
            return;
        }

        const state = this.forwardStack.pop();

        if (!state) {
            return;
        }

        this.backwardStack.push(state);
        this.applyState(state);
    }

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

    canRedo() {
        return this.backwardStack.length > 0;
    }

    canUndo() {
        return this.forwardStack.length > 0;
    }
}
