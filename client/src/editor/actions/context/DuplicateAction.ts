import type {ActionKeybind, ActionParameters} from "@/editor/actions/EditorAction";
import {EditorBlock} from "@/editor/block/EditorBlock";
import {ContextAction} from "@/editor/actions/ContextAction";

export class DuplicateAction extends ContextAction {
    constructor() {
        super("duplicate");
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

    override getKeybinds(): ActionKeybind[] {
        return [
            {
                key: 'd',
                ctrlKey: 'ALWAYS',
                shiftKey: 'NEVER',
                altKey: 'NEVER',
                mode: 'COULD_BE_VISIBLE'
            },
        ]
    };
}
