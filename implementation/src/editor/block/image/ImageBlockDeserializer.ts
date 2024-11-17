import type {BlockDeserializer} from "@/editor/block/BlockDeserializer";
import type {Block} from "@/editor/block/Block";
import {TextBlock} from "@/editor/block/text/TextBlock";
import {ImageBlock} from "@/editor/block/image/ImageBlock";

export class ImageBlockDeserializer implements BlockDeserializer {
    deserialize(data: any): Block {
        const block = new ImageBlock(data.id, data.position, data.size, data.rotation, data.zIndex, data.imageUrl);

        if (data.locked)
            block.lock();

        return block;
    }
}
