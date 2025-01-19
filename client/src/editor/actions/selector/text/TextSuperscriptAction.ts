import {SelectorAction} from "@/editor/actions/SelectorAction";
import type {ActionParameters} from "@/editor/actions/EditorAction";
import type {TextEditorBlock} from "@/editor/block/text/TextEditorBlock";

export class TextSuperscriptAction extends SelectorAction {
    constructor() {
        super("text-superscript", "Make superscript", "mdi mdi-format-superscript");
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

        editor.chain().focus().toggleSuperscript().run();
    }
}
