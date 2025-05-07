import type {ActionKeybind, ActionParameters} from "@/editor/actions/EditorAction";
import {ContextAction} from "@/editor/actions/ContextAction";

/**
 * Represents the action of redoing the last undone operation in the editor's history.
 * This action is always available via its keybind but is not visible in the context menu.
 */
export class RedoAction extends ContextAction {
    constructor() {
        super("redo");
    }

    override isVisible(param: ActionParameters) {
        return false;
    }

    override run(param: ActionParameters) {
        param.editor.getHistory().redo();
    }

    override getKeybinds(): ActionKeybind[] {
        return [
            {
                key: 'y',
                ctrlKey: 'ALWAYS',
                shiftKey: 'NEVER',
                altKey: 'NEVER',
                mode: 'ALWAYS'
            },
        ]
    };
}
