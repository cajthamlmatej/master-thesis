import type {ActionParameters} from "@/editor/actions/EditorAction";
import {ContextAction} from "@/editor/actions/ContextAction";

export class DeleteAction extends ContextAction {
    constructor() {
        super("delete", "Delete");
    }

    override isVisible(param: ActionParameters) {
        return param.selected.every(b => b.editorSupport().selection && !b.locked) && param.selected.length >= 1
    }

    override run(param: ActionParameters) {
        param.selected.forEach(b => param.editor.removeBlock(b));
    }
}
