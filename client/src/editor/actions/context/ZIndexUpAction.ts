import type {ActionParameters} from "@/editor/actions/EditorAction";
import {ContextAction} from "@/editor/actions/ContextAction";

export class ZIndexUpAction extends ContextAction {
    constructor() {
        super("zIndexUp", "Push forward");
    }

    override isVisible(param: ActionParameters) {
        return param.selected.every(b => b.editorSupport().zIndex && !b.locked) && param.selected.length >= 1;
    }

    override run(param: ActionParameters) {
        param.selected.forEach(b => b.zIndexUp());
        param.editor.events.HISTORY.emit();
    }
}
