import type {ActionKeybind, ActionParameters} from "@/editor/actions/EditorAction";
import {ContextAction} from "@/editor/actions/ContextAction";

export class SelectAllAction extends ContextAction {
    constructor() {
        super("select-all");
    }

    override isVisible(param: ActionParameters) {
        return false;
    }

    override run(param: ActionParameters) {
        param.editor.getSelector().deselectAllBlocks();

        for (let block of param.editor.getBlocks()) {
            param.editor.getSelector().selectBlock(block, true);
        }
    }

    override getKeybinds(): ActionKeybind[] {
        return [
            {
                key: 'a',
                ctrlKey: 'ALWAYS',
                shiftKey: 'NEVER',
                altKey: 'NEVER',
                mode: 'ALWAYS'
            },
        ]
    };
}
