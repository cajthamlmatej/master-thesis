import Event from "@/utils/Event";
import type {Block} from "@/editor/block/Block";

export default class EditorEvents {

    public BLOCK_GROUP_CHANGED = new Event<Block[]>();

};
