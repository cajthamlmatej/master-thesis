import type {ActionKeybind, ActionParameters} from "@/editor/actions/EditorAction";
import {ContextAction} from "@/editor/actions/ContextAction";

/**
 * Represents the action of resizing the canvas to fit its parent container.
 * This action is always available via its keybind but is not visible in the context menu.
 */
export class FitCanvasToParentAction extends ContextAction {
    constructor() {
        super("fit-canvas-to-parent");
    }

    override isVisible(param: ActionParameters) {
        return false;
    }

    override run(param: ActionParameters) {
        param.editor.fitToParent();
    }

    override getKeybinds(): ActionKeybind[] {
        return [
            {
                key: ' ',
                ctrlKey: 'NEVER',
                shiftKey: 'NEVER',
                altKey: 'NEVER',
                mode: 'ALWAYS'
            },
        ]
    };
}
