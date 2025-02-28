import {EditorBlock} from "@/editor/block/EditorBlock";
import {PlayerBlock} from "@/editor/block/PlayerBlock";

export abstract class BlockRenderer<T extends EditorBlock | PlayerBlock> {

    public abstract render(block: T): Promise<string>;

}
