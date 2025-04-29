import type {ActionKeybind, ActionParameters} from "@/editor/actions/EditorAction";
import {ContextAction} from "@/editor/actions/ContextAction";

export class UndoAction extends ContextAction {
    constructor() {
        super("undo");
    }

    override isVisible(param: ActionParameters) {
        return false;
    }

    override run(param: ActionParameters) {
        param.editor.getHistory().undo();
    }

    override getKeybinds(): ActionKeybind[] {
        return [
            {
                key: 'z',
                ctrlKey: 'ALWAYS',
                shiftKey: 'NEVER',
                altKey: 'NEVER',
                mode: 'ALWAYS'
            },
        ]
    };
}
