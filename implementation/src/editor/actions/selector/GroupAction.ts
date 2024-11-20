import {SelectorAction} from "@/editor/actions/SelectorAction";
import type {ActionParameters} from "@/editor/actions/EditorAction";
import {EditorBlock} from "@/editor/block/EditorBlock";
import {generateUUID} from "@/utils/Generators";

export class GroupAction extends SelectorAction {
    constructor() {
        super("group", "Group", "mdi mdi-group");
    }

    override isVisible(param: ActionParameters) {
        const groups = param.selected.reduce((acc, b) => acc.add(b.group), new Set<string | undefined>());
        return param.selected.every(b => b.editorSupport().group)
            && param.selected.length > 1
            && (groups.size > 1 || (groups.size == 1 && groups.has(undefined)));
    }
    override run(param: ActionParameters) {
        let modified = new Set<EditorBlock>();

        let groupId = generateUUID();
        let handleGroups = new Set<string>();

        for (const block of param.selected) {
            if (block.group) {
                handleGroups.add(block.group);
            }

            block.group = groupId;
            modified.add(block);
        }

        for (const group of handleGroups) {
            const groupBlocks = param.editor.getBlocksInGroup(group)

            if (groupBlocks.length <= 1) {
                for (const block of groupBlocks) {
                    block.group = undefined;
                    modified.add(block);
                }
            }
        }

        param.editor.events.BLOCK_GROUP_CHANGED.emit(Array.from(modified));
    }
}
