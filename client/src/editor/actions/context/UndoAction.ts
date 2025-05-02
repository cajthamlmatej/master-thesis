import type {ActionKeybind, ActionParameters} from "@/editor/actions/EditorAction";
import {ContextAction} from "@/editor/actions/ContextAction";

/**
 * Represents the action of undoing the last operation in the editor's history.
 * This action is always available via its keybind but is not visible in the context menu.
 */
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
