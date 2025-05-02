import type {ActionParameters} from "@/editor/actions/EditorAction";
import {ContextAction} from "@/editor/actions/ContextAction";

/**
 * Represents the action of moving selected blocks to the topmost z-index.
 * This action is visible when at least one block is selected, all selected blocks support z-index, and none are locked.
 */
export class ZIndexTopAction extends ContextAction {
    constructor() {
        super("z-index-top");
    }

    override isVisible(param: ActionParameters) {
        return param.selected.every(b => b.editorSupport().zIndex && !b.locked) && param.selected.length >= 1;
    }

    override run(param: ActionParameters) {
        param.selected.forEach(b => b.zIndexMaxUp());
        param.editor.events.HISTORY.emit();
    }
}
