import {EditorBlock} from "@/editor/block/EditorBlock";
import type {BlockDeserializer} from "@/editor/block/BlockDeserializer";
import type {Type} from "@/utils/TypeScriptTypes";
import type {PlayerBlock} from "@/editor/block/PlayerBlock";

interface BlockRegistryEntry {
    name: string;
    editor: Type<EditorBlock>;
    player: Type<PlayerBlock>;
    deserializer: Type<BlockDeserializer>;
}

export class BlockRegistry {
    private entries: BlockRegistryEntry[] = [];

    public register(name: string, editor: Type<EditorBlock>, player: Type<PlayerBlock>, deserializer: Type<BlockDeserializer>) {
        if (this.entries.find(entry => entry.name === name)) {
            throw new Error(`Block with name ${name} is already registered`);
        }

        this.entries.push({name, editor, player, deserializer});
    }

    public deserializeEditor(data: any): EditorBlock | undefined {
        const type = data.type as string;

        const entry = this.entries.find(entry => entry.name === type);

        if (!entry) {
            console.error(`Block with type ${type} is not registered. Cannot deserialize.`);
            return undefined;
        }

        // TODO: this is weird
        const deserializer = new entry.deserializer();

        return deserializer.deserializeEditor(data);
    }

    public deserializePlayer(data: any): PlayerBlock | undefined {
        const type = data.type as string;

        const entry = this.entries.find(entry => entry.name === type);

        if (!entry) {
            console.error(`Block with type ${type} is not registered. Cannot deserialize.`);
            return undefined;
        }

        const deserializer = new entry.deserializer();

        return deserializer.deserializePlayer(data);
    }
}
