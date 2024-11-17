import type {BlockDeserializer} from "@/editor/block/BlockDeserializer";
import type {Block} from "@/editor/block/Block";
import {TextBlock} from "@/editor/block/text/TextBlock";
import {ImageBlock} from "@/editor/block/image/ImageBlock";
import {RectangleBlock} from "@/editor/block/rectangle/RectangleBlock";

export class RectangleBlockDeserializer implements BlockDeserializer {
    deserialize(data: any): Block {
        const block = new RectangleBlock(data.id, data.position, data.size, data.rotation, data.zIndex, data.color);

        if (data.locked)
            block.lock();

        return block;
    }
}
