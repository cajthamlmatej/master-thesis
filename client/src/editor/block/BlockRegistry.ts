import {EditorBlock} from "@/editor/block/EditorBlock";
import type {BlockDeserializer} from "@/editor/block/serialization/BlockDeserializer";
import type {Type} from "@/utils/TypeScriptTypes";
import type {PlayerBlock} from "@/editor/block/PlayerBlock";
import {TextEditorBlock} from "@/editor/block/base/text/TextEditorBlock";
import {TextPlayerBlock} from "@/editor/block/base/text/TextPlayerBlock";
import {TextBlockDeserializer} from "@/editor/block/base/text/TextBlockDeserializer";
import {ImageEditorBlock} from "@/editor/block/base/image/ImageEditorBlock";
import {ImagePlayerBlock} from "@/editor/block/base/image/ImagePlayerBlock";
import {ImageBlockDeserializer} from "@/editor/block/base/image/ImageBlockDeserializer";
import {WatermarkEditorBlock} from "@/editor/block/base/watermark/WatermarkEditorBlock";
import {WatermarkPlayerBlock} from "@/editor/block/base/watermark/WatermarkPlayerBlock";
import {WatermarkBlockDeserializer} from "@/editor/block/base/watermark/WatermarkBlockDeserializer";
import {ShapeEditorBlock} from "@/editor/block/base/shape/ShapeEditorBlock";
import {ShapePlayerBlock} from "@/editor/block/base/shape/ShapePlayerBlock";
import {ShapeBlockDeserializer} from "@/editor/block/base/shape/ShapeBlockDeserializer";
import {InteractiveAreaEditorBlock} from "@/editor/block/base/interactiveArea/InteractiveAreaEditorBlock";
import {InteractiveAreaPlayerBlock} from "@/editor/block/base/interactiveArea/InteractiveAreaPlayerBlock";
import {InteractiveAreaBlockDeserializer} from "@/editor/block/base/interactiveArea/InteractiveAreaBlockDeserializer";
import {MermaidEditorBlock} from "@/editor/block/base/mermaid/MermaidEditorBlock";
import {MermaidPlayerBlock} from "@/editor/block/base/mermaid/MermaidPlayerBlock";
import {MermaidBlockDeserializer} from "@/editor/block/base/mermaid/MermaidBlockDeserializer";
import {IframeEditorBlock} from "@/editor/block/base/iframe/IframeEditorBlock";
import {IframePlayerBlock} from "@/editor/block/base/iframe/IframePlayerBlock";
import {IframeBlockDeserializer} from "@/editor/block/base/iframe/IframeBlockDeserializer";
import {PluginEditorBlock} from "@/editor/block/base/plugin/PluginEditorBlock";
import {PluginPlayerBlock} from "@/editor/block/base/plugin/PluginPlayerBlock";
import {PluginBlockDeserializer} from "@/editor/block/base/plugin/PluginBlockDeserializer";
import {ChatEditorBlock} from "@/editor/block/base/chat/ChatEditorBlock";
import {ChatPlayerBlock} from "@/editor/block/base/chat/ChatPlayerBlock";
import {ChatBlockDeserializer} from "@/editor/block/base/chat/ChatBlockDeserializer";
import {LatexEditorBlock} from "@/editor/block/base/latex/LatexEditorBlock";
import {LatexPlayerBlock} from "@/editor/block/base/latex/LatexPlayerBlock";
import {LatexBlockDeserializer} from "@/editor/block/base/latex/LatexBlockDeserializer";
// $ADD_BLOCK_REGISTRY_IMPORT

// note(Matej): dont remove $ADD_BLOCK_REGISTRY_* comments, it is used by the generator

interface BlockRegistryEntry {
    name: string;
    editor: Type<EditorBlock>;
    player: Type<PlayerBlock>;
    deserializer: Type<BlockDeserializer>;
}

/**
 * The BlockRegistry class is responsible for managing the registration and deserialization
 * of different types of blocks used in the editor and player. It maintains a registry
 * of block types and their corresponding editor, player, and deserializer classes.
 */
export class BlockRegistry {
    private entries: BlockRegistryEntry[] = [];

    /**
     * Initializes the BlockRegistry and registers the default block types.
     */
    public constructor() {
        // Registers default block types
        this.register("text", TextEditorBlock, TextPlayerBlock, TextBlockDeserializer);
        this.register("image", ImageEditorBlock, ImagePlayerBlock, ImageBlockDeserializer);
        this.register("watermark", WatermarkEditorBlock, WatermarkPlayerBlock, WatermarkBlockDeserializer);
        this.register("shape", ShapeEditorBlock, ShapePlayerBlock, ShapeBlockDeserializer);
        this.register("interactiveArea", InteractiveAreaEditorBlock, InteractiveAreaPlayerBlock, InteractiveAreaBlockDeserializer);
        this.register("mermaid", MermaidEditorBlock, MermaidPlayerBlock, MermaidBlockDeserializer);
        this.register("iframe", IframeEditorBlock, IframePlayerBlock, IframeBlockDeserializer);
        this.register("plugin", PluginEditorBlock, PluginPlayerBlock, PluginBlockDeserializer);
        this.register("chat", ChatEditorBlock, ChatPlayerBlock, ChatBlockDeserializer);
        this.register("latex", LatexEditorBlock, LatexPlayerBlock, LatexBlockDeserializer);
        // $ADD_BLOCK_REGISTRY_ENTRY
    }

    /**
     * Registers a new block type in the registry.
     * 
     * @param name - The unique name of the block type.
     * @param editor - The editor block class for this block type.
     * @param player - The player block class for this block type.
     * @param deserializer - The deserializer class for this block type.
     * @throws Error if a block with the same name is already registered.
     */
    public register(name: string, editor: Type<EditorBlock>, player: Type<PlayerBlock>, deserializer: Type<BlockDeserializer>) {
        if (this.entries.find(entry => entry.name === name)) {
            throw new Error(`Block with name ${name} is already registered`);
        }

        this.entries.push({name, editor, player, deserializer});
    }

    /**
     * Deserializes data into an editor block instance.
     * 
     * @param data - The serialized data of the block.
     * @returns The deserialized editor block instance, or undefined if the block type is not registered.
     */
    public deserializeEditor(data: any): EditorBlock | undefined {
        const type = data.type as string;

        const entry = this.entries.find(entry => entry.name === type);

        if (!entry) {
            console.error(`Block with type ${type} is not registered. Cannot deserialize.`);
            return undefined;
        }

        const deserializer = new entry.deserializer();

        return deserializer.deserializeEditor(data);
    }

    /**
     * Deserializes data into a player block instance.
     * 
     * @param data - The serialized data of the block.
     * @returns The deserialized player block instance, or undefined if the block type is not registered.
     */
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
