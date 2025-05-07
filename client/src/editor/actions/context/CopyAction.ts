import type {ActionKeybind, ActionParameters} from "@/editor/actions/EditorAction";
import {ContextAction} from "@/editor/actions/ContextAction";

/**
 * Represents the action of copying selected blocks to the clipboard.
 * This action is visible when at least one block is selected and all selected blocks support selection.
 */
export class CopyAction extends ContextAction {
    constructor() {
        super("copy");
    }

    override isVisible(param: ActionParameters) {
        return param.selected.every(b => b.editorSupport().selection) && param.selected.length >= 1;
    }

    override run(param: ActionParameters) {
        param.editor.getClipboard().markForCopy(param.selected);
    }

    override getKeybinds(): ActionKeybind[] {
        return [
            {
                key: 'c',
                ctrlKey: 'ALWAYS',
                shiftKey: 'NEVER',
                altKey: 'NEVER',
                mode: 'COULD_BE_VISIBLE'
            },
        ]
    };
}
