import {SelectorAction} from "@/editor/actions/SelectorAction";
import type {ActionParameters} from "@/editor/actions/EditorAction";

export class UnlockAction extends SelectorAction {
    constructor() {
        super("unlock", "mdi mdi-lock-open");
    }

    override isVisible(param: ActionParameters) {
        return param.selected.every(b => b.editorSupport().lock)
            && param.selected.some(b => b.locked);
    }

    override run(param: ActionParameters) {
        for (const block of param.selected) {
            block.unlock();
        }
        param.editor.events.BLOCK_LOCK_CHANGED.emit({
            blocks: param.selected,
            locked: false
        });
        param.editor.events.HISTORY.emit();
    }
}
