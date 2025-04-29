import {SelectorAction} from "@/editor/actions/SelectorAction";
import type {ActionParameters} from "@/editor/actions/EditorAction";

export class BringBackAction extends SelectorAction {
    constructor() {
        super("bring-back", "mdi mdi-adjust");
    }

    override isVisible(param: ActionParameters) {
        return param.selected.every(b => b.editorSupport().selection && !b.locked)
            && param.selected.some(b => b.position.x < 0 || b.position.y < 0
                || b.position.x + b.size.width > param.editor.getSize().width
                || b.position.y + b.size.height > param.editor.getSize().height);
    }

    override run(param: ActionParameters) {
        for (const block of param.selected) {
            const newX = Math.max(0, Math.min(param.editor.getSize().width - block.size.width, block.position.x));
            const newY = Math.max(0, Math.min(param.editor.getSize().height - block.size.height, block.position.y));

            // TODO: in future really move the block correctly by its position

            block.move(newX, newY, false, true);
        }
        param.editor.events.HISTORY.emit();
    }
}
