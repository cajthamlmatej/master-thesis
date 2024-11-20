import {SelectorAction} from "@/editor/actions/SelectorAction";
import type {ActionParameters} from "@/editor/actions/EditorAction";
import {EditorBlock} from "@/editor/block/EditorBlock";
import {generateUUID} from "@/utils/Generators";
import {ContextAction} from "@/editor/actions/ContextAction";

export class ZIndexTopAction extends ContextAction {
    constructor() {
        super("zIndexTop", "Push to top");
    }

    override isVisible(param: ActionParameters) {
        return param.selected.every(b => b.editorSupport().zIndex && !b.locked) && param.selected.length >= 1;
    }
    override run(param: ActionParameters) {
        param.selected.forEach(b => b.zIndexMaxUp());
    }
}
