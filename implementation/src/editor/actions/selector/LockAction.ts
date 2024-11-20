import {SelectorAction} from "@/editor/actions/SelectorAction";
import type {ActionParameters} from "@/editor/actions/EditorAction";

export class LockAction extends SelectorAction {
    constructor() {
        super("lock", "Lock", "mdi mdi-lock");
    }

    override isVisible(param: ActionParameters) {
        return param.selected.every(b => b.editorSupport().lock && !b.locked);
    }

    override run(param: ActionParameters) {
        for (const block of param.selected) {
            block.lock();
        }
        param.editor.events.BLOCK_LOCK_CHANGED.emit({
            blocks: param.selected,
            locked: true
        });
    }
}
