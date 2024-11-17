import Event from "@/utils/Event";
import type {Block} from "@/editor/block/Block";
import type {EditorMode} from "@/editor/EditorMode";

export default class EditorEvents {

    public BLOCK_GROUP_CHANGED = new Event<Block[]>();
    public BLOCK_LOCK_CHANGED = new Event<{
        blocks: Block[],
        locked: boolean
    }>();
    public MODE_CHANGED = new Event<EditorMode>();

};
