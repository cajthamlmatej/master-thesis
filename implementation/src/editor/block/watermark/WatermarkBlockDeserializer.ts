import type {BlockDeserializer} from "@/editor/block/BlockDeserializer";
import type {Block} from "@/editor/block/Block";
import {WatermarkBlock} from "@/editor/block/watermark/WatermarkBlock";

export class WatermarkBlockDeserializer implements BlockDeserializer {
    deserialize(data: any): Block {
        return new WatermarkBlock(data.id);
    }
}
