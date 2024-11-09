import Event from "@/utils/Event";
import {Block} from "@/editor/block/Block";

export default class EditorSelectorEvents {

    public SELECTION_CHANGED = new Event<Block[]>();
    public SELECTION_AREA_CHANGED = new Event<{x: number, y: number, width: number, height: number, rotation: number}>();

}
