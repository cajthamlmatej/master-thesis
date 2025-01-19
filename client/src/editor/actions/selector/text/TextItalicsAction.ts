import {SelectorAction} from "@/editor/actions/SelectorAction";
import type {ActionParameters} from "@/editor/actions/EditorAction";
import type {TextEditorBlock} from "@/editor/block/text/TextEditorBlock";

export class TextItalicsAction extends SelectorAction {
    constructor() {
        super("text-italics", "Make italics", "mdi mdi-format-italic");
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

        editor.chain().focus().toggleItalic().run();
    }
}
