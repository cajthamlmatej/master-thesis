import {EditorBlock} from "@/editor/block/EditorBlock";
import type {BlockDeserializer} from "@/editor/block/serialization/BlockDeserializer";
import type {Type} from "@/utils/TypeScriptTypes";
import type {PlayerBlock} from "@/editor/block/PlayerBlock";
import {TextEditorBlock} from "@/editor/block/text/TextEditorBlock";
import {TextPlayerBlock} from "@/editor/block/text/TextPlayerBlock";
import {TextBlockDeserializer} from "@/editor/block/text/TextBlockDeserializer";
import {ImageEditorBlock} from "@/editor/block/image/ImageEditorBlock";
import {ImagePlayerBlock} from "@/editor/block/image/ImagePlayerBlock";
import {ImageBlockDeserializer} from "@/editor/block/image/ImageBlockDeserializer";
import {WatermarkEditorBlock} from "@/editor/block/watermark/WatermarkEditorBlock";
import {WatermarkPlayerBlock} from "@/editor/block/watermark/WatermarkPlayerBlock";
import {WatermarkBlockDeserializer} from "@/editor/block/watermark/WatermarkBlockDeserializer";
import {ShapeEditorBlock} from "@/editor/block/shape/ShapeEditorBlock";
import {ShapePlayerBlock} from "@/editor/block/shape/ShapePlayerBlock";
import {ShapeBlockDeserializer} from "@/editor/block/shape/ShapeBlockDeserializer";
import {InteractiveAreaEditorBlock} from "@/editor/block/interactiveArea/InteractiveAreaEditorBlock";
import {InteractiveAreaPlayerBlock} from "@/editor/block/interactiveArea/InteractiveAreaPlayerBlock";
import {InteractiveAreaBlockDeserializer} from "@/editor/block/interactiveArea/InteractiveAreaBlockDeserializer";
import {MermaidEditorBlock} from "@/editor/block/mermaid/MermaidEditorBlock";
import {MermaidPlayerBlock} from "@/editor/block/mermaid/MermaidPlayerBlock";
import {MermaidBlockDeserializer} from "@/editor/block/mermaid/MermaidBlockDeserializer";
// $ADD_BLOCK_REGISTRY_IMPORT

// note(Matej): dont remove $ADD_BLOCK_REGISTRY_* comments, it is used by the generator

interface BlockRegistryEntry {
    name: string;
    editor: Type<EditorBlock>;
    player: Type<PlayerBlock>;
    deserializer: Type<BlockDeserializer>;
}

export class BlockRegistry {
    private entries: BlockRegistryEntry[] = [];

    public constructor() {
        this.register("text", TextEditorBlock, TextPlayerBlock, TextBlockDeserializer);
        this.register("image", ImageEditorBlock, ImagePlayerBlock, ImageBlockDeserializer);
        this.register("watermark", WatermarkEditorBlock, WatermarkPlayerBlock, WatermarkBlockDeserializer);
        this.register("shape", ShapeEditorBlock, ShapePlayerBlock, ShapeBlockDeserializer);
        this.register("interactiveArea", InteractiveAreaEditorBlock, InteractiveAreaPlayerBlock, InteractiveAreaBlockDeserializer);
        this.register("mermaid", MermaidEditorBlock, MermaidPlayerBlock, MermaidBlockDeserializer);
        // $ADD_BLOCK_REGISTRY_ENTRY
    }

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
