import Player from "@/editor/player/Player";
import {PlayerPluginCommunicator} from "@/editor/player/PlayerPluginCommunicator";
import {PlayerBlock} from "@/editor/block/PlayerBlock";
import {BlockRegistry} from "@/editor/block/BlockRegistry";
import {MaterialOptions} from "@/editor/MaterialOptions";
import {SlideData} from "@/models/Material";
import {usePluginStore} from "@/stores/plugin";
import {PluginManager} from "../plugin/PluginManager";

/**
 * The PlayerDeserializer class is responsible for deserializing slide data into a Player instance.
 * It processes blocks, initializes the Player, and loads plugins.
 */
export class PlayerDeserializer {

    /**
     * Deserializes slide data into a Player instance.
     * 
     * @param data - The slide data containing editor and block information.
     * @param element - The HTML element where the Player will be rendered.
     * @param rendering - A flag indicating whether the Player is in rendering mode.
     * @returns A promise that resolves to the initialized Player instance.
     */
    async deserialize(data: SlideData, element: HTMLElement, rendering: boolean = false) {
        const editorData = data.editor as MaterialOptions;
        const blocksData = data.blocks;

        let blocks = [] as PlayerBlock[];
        const blockRegistry = new BlockRegistry();

        for (let blockData of blocksData) {
            const block = blockRegistry.deserializePlayer(blockData);

            if (block) {
                if (rendering) {
                    block.interactivity = [];
                }

                blocks.push(block);
            }
        }

        const player = new Player(element, editorData);

        const pluginStore = usePluginStore();
        await pluginStore.loadPlugins(undefined, player);

        player.addBlocks(blocks);

        player.setPluginCommunicator(new PlayerPluginCommunicator(pluginStore.manager as PluginManager));

        return player;

    }

}
