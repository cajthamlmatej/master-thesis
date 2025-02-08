import type {ActionParameters} from "@/editor/actions/EditorAction";
import {ContextAction} from "@/editor/actions/ContextAction";
import type {ActionKeybind} from "@/editor/actions/EditorAction";

export class DeleteAction extends ContextAction {
    constructor() {
        super("delete");
    }

    override isVisible(param: ActionParameters) {
        return param.selected.every(b => b.editorSupport().selection && !b.locked) && param.selected.length >= 1
    }

    override run(param: ActionParameters) {
        param.selected.forEach(b => param.editor.removeBlock(b));
    }

    override getKeybinds(): ActionKeybind[] {
        return [
            {
                key: 'Delete',
                ctrlKey: 'NEVER',
                shiftKey: 'NEVER',
                altKey: 'NEVER',
                mode: 'COULD_BE_VISIBLE'
            },
        ]
    };
}
