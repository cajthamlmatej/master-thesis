import type {ActionParameters} from "@/editor/actions/EditorAction";
import {ContextAction} from "@/editor/actions/ContextAction";
import type {ActionKeybind} from "@/editor/actions/EditorAction";

export class CopyAction extends ContextAction {
    constructor() {
        super("copy");
    }

    override isVisible(param: ActionParameters) {
        return param.selected.every(b => b.editorSupport().selection) && param.selected.length >= 1;
    }

    override run(param: ActionParameters) {
        param.editor.getClipboard().markForCopy(param.selected);
    }

    override getKeybinds(): ActionKeybind[] {
        return [
            {
                key: 'c',
                ctrlKey: 'ALWAYS',
                shiftKey: 'NEVER',
                altKey: 'NEVER',
                mode: 'COULD_BE_VISIBLE'
            },
        ]
    };
}
