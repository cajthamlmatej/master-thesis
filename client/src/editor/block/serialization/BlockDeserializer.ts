import type {EditorBlock} from "@/editor/block/EditorBlock";
import type {PlayerBlock} from "@/editor/block/PlayerBlock";

import {BlockConstructor} from "@/editor/block/BlockConstructor";

export abstract class BlockDeserializer {
    abstract deserializeEditor(data: any): EditorBlock;

    abstract deserializePlayer(data: any): PlayerBlock;

    public getBaseBlockData(data: any): BlockConstructor {
        return {
            id: data.id,
            position: data.position,
            size: data.size,
            rotation: data.rotation,
            zIndex: data.zIndex,
            locked: data.locked,
            type: data.type,
            interactivity: data.interactivity,
        }
    }
}
