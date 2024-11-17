import type {BlockDeserializer} from "@/editor/block/BlockDeserializer";
import type {Block} from "@/editor/block/Block";
import {TextBlock} from "@/editor/block/text/TextBlock";

export class TextBlockDeserializer implements BlockDeserializer {
    deserialize(data: any): Block {
        const block = new TextBlock(data.id, data.position, data.size, data.rotation, data.zIndex, data.content, data.fontSize);

        if (data.locked)
            block.lock();

        return block;
    }
}
