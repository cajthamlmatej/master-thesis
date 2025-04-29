import type {ActionKeybind, ActionParameters} from "@/editor/actions/EditorAction";
import {ContextAction} from "@/editor/actions/ContextAction";

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
