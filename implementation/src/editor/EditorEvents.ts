import Event from "@/utils/Event";
import type {Block} from "@/editor/block/Block";

export default class EditorEvents {

    public BLOCK_GROUP_CHANGED = new Event<Block[]>();
    public BLOCK_LOCK_CHANGED = new Event<{
        blocks: Block[],
        locked: boolean
    }>();

};
