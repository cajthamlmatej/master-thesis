import Player from "@/editor/player/Player";
import {PlayerPluginCommunicator} from "@/editor/player/PlayerPluginCommunicator";
import {PlayerBlock} from "@/editor/block/PlayerBlock";
import {BlockRegistry} from "@/editor/block/BlockRegistry";
import {MaterialOptions} from "@/editor/MaterialOptions";

export class PlayerDeserializer {

    deserialize(data: string, element: HTMLElement, communicator: PlayerPluginCommunicator, rendering: boolean = false): Player {
        const parsedData = JSON.parse(data);
        const editorData = parsedData.editor as MaterialOptions;
        const blocksData = parsedData.blocks;

        let blocks = [] as PlayerBlock[];
        const blockRegistry = new BlockRegistry();

        for (let blockData of blocksData) {
            const block = blockRegistry.deserializePlayer(blockData);

            if (block) {
                if(rendering) {
                    block.interactivity = [];
                }

                blocks.push(block);
            }
        }

        const player = new Player(element, editorData, blocks);

        player.setPluginCommunicator(communicator);

        return player;

    }

}
