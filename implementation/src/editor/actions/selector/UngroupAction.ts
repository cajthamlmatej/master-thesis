import {SelectorAction} from "@/editor/actions/SelectorAction";
import type {ActionParameters} from "@/editor/actions/EditorAction";
import {EditorBlock} from "@/editor/block/EditorBlock";
import {generateUUID} from "@/utils/Generators";

export class UngroupAction extends SelectorAction {
    constructor() {
        super("ungroup", "Ungroup", "mdi mdi-ungroup");
    }

    override isVisible(param: ActionParameters) {
        const groups = param.selected.reduce((acc, b) => acc.add(b.group), new Set<string | undefined>());
        return param.selected.every(b => b.editorSupport().group)
            && param.selected.length > 1
            && groups.size == 1 && !groups.has(undefined);
    }

    override run(param: ActionParameters) {
        for (const block of param.selected) {
            block.group = undefined;
        }

        param.editor.events.BLOCK_GROUP_CHANGED.emit(Array.from(param.selected));
    }
}
