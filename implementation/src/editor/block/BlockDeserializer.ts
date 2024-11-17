import type {Block} from "@/editor/block/Block";

export interface BlockDeserializer {
    deserialize(data: any): Block;
}
