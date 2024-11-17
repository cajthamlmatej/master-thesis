import {Block} from "@/editor/block/Block";
import type {BlockDeserializer} from "@/editor/block/BlockDeserializer";
import type {Type} from "@/utils/TypeScriptTypes";

interface BlockRegistryEntry {
    name: string;
    block: Type<Block>;
    deserializer: Type<BlockDeserializer>;
}

export class BlockRegistry {
    private entries: BlockRegistryEntry[] = [];

    public register(name: string, block: Type<Block>, deserializer: Type<BlockDeserializer>) {
        if (this.entries.find(entry => entry.name === name)) {
            throw new Error(`Block with name ${name} is already registered`);
        }

        this.entries.push({name, block, deserializer});
    }

    public deserialize(data: any): Block | undefined {
        const type = data.type as string;

        const entry = this.entries.find(entry => entry.name === type);

        if (!entry) {
            console.error(`Block with type ${type} is not registered. Cannot deserialize.`);
            return undefined;
        }

        // TODO: this is weird
        const deserializer = new entry.deserializer();

        return deserializer.deserialize(data);
    }
}
