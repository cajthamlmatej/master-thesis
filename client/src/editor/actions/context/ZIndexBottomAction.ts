import type {ActionParameters} from "@/editor/actions/EditorAction";
import {ContextAction} from "@/editor/actions/ContextAction";

export class ZIndexBottomAction extends ContextAction {
    constructor() {
        super("zIndexBottom", "Push to back");
    }

    override isVisible(param: ActionParameters) {
        return param.selected.every(b => b.editorSupport().zIndex && !b.locked) && param.selected.length >= 1;
    }

    override run(param: ActionParameters) {
        param.selected.forEach(b => b.zIndexMaxDown());
        param.editor.events.HISTORY.emit();
    }
}
