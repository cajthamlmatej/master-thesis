import type {ActionParameters} from "@/editor/actions/EditorAction";
import {ContextAction} from "@/editor/actions/ContextAction";

export class PasteAction extends ContextAction {
    constructor() {
        super("paste", "Paste");
    }

    override isVisible(param: ActionParameters) {
        return param.editor.getClipboard().hasContent();
    }
    override run(param: ActionParameters) {
        param.editor.getClipboard().paste(param.position);
    }
}
