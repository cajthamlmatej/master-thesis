import Player from "@/editor/player/Player";
import {PlayerPluginCommunicator} from "@/editor/player/PlayerPluginCommunicator";

export class PlayerDeserializer {

    deserialize(data: string, element: HTMLElement, communicator: PlayerPluginCommunicator): Player {
        const parsedData = JSON.parse(data);
        const editorData = parsedData.editor;
        const blocksData = parsedData.blocks;

        const player = new Player(element, {
            width: editorData.size.width,
            height: editorData.size.height
        }, []);

        player.setPluginCommunicator(communicator);

        for (let blockData of blocksData) {
            const block = player.blockRegistry.deserializePlayer(blockData);

            if (block) {
                player.addBlock(block);
            }
        }

        return player;

    }

}
