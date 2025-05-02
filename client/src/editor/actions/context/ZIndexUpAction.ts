import type {ActionParameters} from "@/editor/actions/EditorAction";
import {ContextAction} from "@/editor/actions/ContextAction";

/**
 * Represents the action of increasing the z-index of selected blocks.
 * This action is visible when at least one block is selected, all selected blocks support z-index, and none are locked.
 */
export class ZIndexUpAction extends ContextAction {
    constructor() {
        super("z-index-up");
    }

    override isVisible(param: ActionParameters) {
        return param.selected.every(b => b.editorSupport().zIndex && !b.locked) && param.selected.length >= 1;
    }

    override run(param: ActionParameters) {
        param.selected.forEach(b => b.zIndexUp());
        param.editor.events.HISTORY.emit();
    }
}
