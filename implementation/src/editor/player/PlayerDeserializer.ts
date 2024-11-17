import Player from "@/editor/player/Player";

export class PlayerDeserializer {

    deserialize(data: string, element: HTMLElement): Player {
        const parsedData = JSON.parse(data);
        const editorData = parsedData.editor;
        const blocksData = parsedData.blocks;

        const player = new Player(element, {
            width: editorData.size.width,
            height: editorData.size.height
        }, []);

        for (let blockData of blocksData) {
            const block = player.blockRegistry.deserializePlayer(blockData);

            if (block) {
                player.addBlock(block);
            }
        }

        return player;

    }

}
