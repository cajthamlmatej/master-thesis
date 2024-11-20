import {SelectorAction} from "@/editor/actions/SelectorAction";
import type {ActionParameters} from "@/editor/actions/EditorAction";
import {EditorBlock} from "@/editor/block/EditorBlock";
import {generateUUID} from "@/utils/Generators";
import {ContextAction} from "@/editor/actions/ContextAction";

export class DuplicateAction extends ContextAction {
    constructor() {
        super("duplicate", "Duplicate");
    }

    override isVisible(param: ActionParameters) {
        return param.selected.every(b => b.editorSupport().selection) && param.selected.length >= 1;
    }
    override run(param: ActionParameters) {
        let newBlocks: EditorBlock[] = [];
        for (let block of param.selected) {
            const clone = block.clone();

            param.editor.addBlock(clone);

            clone.move(clone.position.x + 20, clone.position.y + 20);

            newBlocks.push(clone);
        }

        // Cannot be done in the loop above, because we need cant modify the selection while iterating over it
        param.editor.getSelector().deselectAllBlocks();

        for (let block of newBlocks) {
            param.editor.getSelector().selectBlock(block, true);
        }
    }
}
