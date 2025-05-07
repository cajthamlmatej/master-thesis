import type {EditorBlock} from "@/editor/block/EditorBlock";
import type {PlayerBlock} from "@/editor/block/PlayerBlock";

import {BlockConstructor} from "@/editor/block/BlockConstructor";

/**
 * Abstract class responsible for deserializing block data into specific block types.
 */
export abstract class BlockDeserializer {
    /**
     * Deserializes data into an EditorBlock instance.
     * @param data - The raw data to deserialize.
     * @returns An instance of EditorBlock.
     */
    abstract deserializeEditor(data: any): EditorBlock;

    /**
     * Deserializes data into a PlayerBlock instance.
     * @param data - The raw data to deserialize.
     * @returns An instance of PlayerBlock.
     */
    abstract deserializePlayer(data: any): PlayerBlock;

    /**
     * Extracts the base block data from the raw data.
     * @param data - The raw data containing block properties.
     * @returns A BlockConstructor object containing the base block properties.
     */
    public getBaseBlockData(data: any): BlockConstructor {
        return {
            id: data.id,
            position: data.position,
            size: data.size,
            rotation: data.rotation,
            zIndex: data.zIndex,
            opacity: data.opacity,
            locked: data.locked,
            type: data.type,
            interactivity: data.interactivity,
            group: data.group
        }
    }
}
