import {SelectorAction} from "@/editor/actions/SelectorAction";
import type {ActionParameters} from "@/editor/actions/EditorAction";
import type {TextEditorBlock} from "@/editor/block/text/TextEditorBlock";

export class TextOrderedListAction extends SelectorAction {
    constructor() {
        super("text-Ordered-list", "Make Ordered list", "mdi mdi-format-list-numbered");
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

        editor.chain().focus().toggleOrderedList().run();
    }
}
