import type {ActionParameters} from "@/editor/actions/EditorAction";
import {ContextAction} from "@/editor/actions/ContextAction";

export class CopyAction extends ContextAction {
    constructor() {
        super("copy", "Copy");
    }

    override isVisible(param: ActionParameters) {
        return param.selected.every(b => b.editorSupport().selection) && param.selected.length >= 1;
    }

    override run(param: ActionParameters) {
        param.editor.getClipboard().markForCopy(param.selected);
    }
}
