import type {ActionParameters} from "@/editor/actions/EditorAction";
import {ContextAction} from "@/editor/actions/ContextAction";
import type {ActionKeybind} from "@/editor/actions/EditorAction";

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
