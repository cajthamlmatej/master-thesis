import type {ActionParameters} from "@/editor/actions/EditorAction";
import {ContextAction} from "@/editor/actions/ContextAction";
import type {ActionKeybind} from "@/editor/actions/EditorAction";

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
