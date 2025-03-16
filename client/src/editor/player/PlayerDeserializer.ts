import Player from "@/editor/player/Player";
import {PlayerPluginCommunicator} from "@/editor/player/PlayerPluginCommunicator";
import {PlayerBlock} from "@/editor/block/PlayerBlock";
import {BlockRegistry} from "@/editor/block/BlockRegistry";

export class PlayerDeserializer {

    deserialize(data: string, element: HTMLElement, communicator: PlayerPluginCommunicator, rendering: boolean = false): Player {
        const parsedData = JSON.parse(data);
        const editorData = parsedData.editor;
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

        const player = new Player(element, {
            width: editorData.size.width,
            height: editorData.size.height
        }, blocks);

        player.setPluginCommunicator(communicator);

        return player;

    }

}
