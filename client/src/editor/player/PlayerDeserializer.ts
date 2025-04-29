import Player from "@/editor/player/Player";
import {PlayerPluginCommunicator} from "@/editor/player/PlayerPluginCommunicator";
import {PlayerBlock} from "@/editor/block/PlayerBlock";
import {BlockRegistry} from "@/editor/block/BlockRegistry";
import {MaterialOptions} from "@/editor/MaterialOptions";
import {SlideData} from "@/models/Material";
import {usePluginStore} from "@/stores/plugin";
import {PluginManager} from "../plugin/PluginManager";

export class PlayerDeserializer {

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
