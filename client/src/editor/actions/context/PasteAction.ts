import type {ActionKeybind, ActionParameters} from "@/editor/actions/EditorAction";
import {ContextAction} from "@/editor/actions/ContextAction";

/**
 * Represents the action of pasting content from the clipboard into the editor.
 * This action is visible when the clipboard contains content.
 */
export class PasteAction extends ContextAction {
    constructor() {
        super("paste");
    }

    override isVisible(param: ActionParameters) {
        return param.editor.getClipboard().hasContent();
    }

    override run(param: ActionParameters) {
        param.editor.getClipboard().paste(param.position);
    }

    override getKeybinds(): ActionKeybind[] {
        return [
            {
                key: 'v',
                ctrlKey: 'ALWAYS',
                shiftKey: 'NEVER',
                altKey: 'NEVER',
                mode: 'COULD_BE_VISIBLE'
            },
        ]
    };
}
