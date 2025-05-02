import type {ActionKeybind, ActionParameters} from "@/editor/actions/EditorAction";
import {ContextAction} from "@/editor/actions/ContextAction";
import {EditorMode} from "@/editor/EditorMode";

/**
 * Represents the action of toggling between different editor modes (e.g., MOVE and SELECT).
 * This action is always available via its keybind but is not visible in the context menu.
 */
export class ModeAction extends ContextAction {
    constructor() {
        super("mode");
    }

    override isVisible(param: ActionParameters) {
        return false;
    }

    override run(param: ActionParameters) {
        const mode = param.editor.getMode();

        switch (mode) {
            case EditorMode.MOVE:
                param.editor.setMode(EditorMode.SELECT);
                break;
            case EditorMode.SELECT:
                param.editor.setMode(EditorMode.MOVE);
                break;
        }
    }

    override getKeybinds(): ActionKeybind[] {
        return [
            {
                key: 'F2',
                ctrlKey: 'NEVER',
                shiftKey: 'NEVER',
                altKey: 'NEVER',
                mode: 'ALWAYS'
            },
        ]
    };
}
