import type {EditorBlock} from "@/editor/block/EditorBlock";
import type {PlayerBlock} from "@/editor/block/PlayerBlock";

export interface BlockDeserializer {
    deserializeEditor(data: any): EditorBlock;

    deserializePlayer(data: any): PlayerBlock;
}
