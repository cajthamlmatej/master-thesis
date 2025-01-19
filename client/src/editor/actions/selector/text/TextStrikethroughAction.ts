import {SelectorAction} from "@/editor/actions/SelectorAction";
import type {ActionParameters} from "@/editor/actions/EditorAction";
import type {TextEditorBlock} from "@/editor/block/text/TextEditorBlock";

export class TextStrikethroughAction extends SelectorAction {
    constructor() {
        super("text-strikethrough", "Make strikethrough", "mdi mdi-format-strikethrough");
    }

    override isVisible(param: ActionParameters) {
        return param.selected.every(b => b.type === "text") && param.selected.length === 1;
    }

    override run(param: ActionParameters) {
        const block = param.selected[0]! as TextEditorBlock;

        const editor = block.getTextEditor();

        if(!editor) {
            return;
        }

        editor.chain().focus().toggleStrike().run();
    }
}
