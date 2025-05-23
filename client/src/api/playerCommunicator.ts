import Material from "@/models/Material";
import {communicator} from "@/api/websockets";
import {BlockEvent} from "@/editor/block/events/BlockEvent";

export class PlayerCommunicator {
    isPresenter: boolean;
    private material: Material;
    private joinedResolve: () => void;
    public readonly joined: Promise<void> = new Promise<void>((resolve) => this.joinedResolve = resolve);

    private watchers = new Set<string>();
    
    private code:string;
    private slideId: string;

    constructor(material: Material, code: string, isPresenter: boolean, slideId: string) {
        this.material = material;
        this.isPresenter = isPresenter;
        this.code = code;
        this.slideId = slideId;

        communicator.socket.emit("joinPlayerMaterialRoom", {
            materialId: material.id,
            code,
            slideId,
        });

        communicator.socket.on("changeSlide", async ({slideId}: { slideId: string }) => {
            if (isPresenter) {
                return;
            }

            const playerStore = (await import("@/stores/player")).usePlayerStore();

            const slide = this.material.slides.find((s) => s.id === slideId);

            if (!slide) {
                return;
            }

            this.slideId = slideId;

            await playerStore.changeSlide(slide);
        });
        // communicator.socket.on("changeCanvas", async({position, scale}: {position: {x: number; y: number}; scale: number}) => {
        //     const playerStore = (await import("@/stores/player")).usePlayerStore();
        //     const player = playerStore.getPlayer()!;
        //
        //     player.setPosition(position.x, position.y);
        //     player.setScale(scale);
        //     player.updateElement();
        // });
        communicator.socket.on("presenterDisconnected", async () => {
            const playerStore = (await import("@/stores/player")).usePlayerStore();
            playerStore.watchEnded = true;
        });
        communicator.socket.on("synchronizeDraw", async ({content, slideId}: { content: string, slideId: string }) => {
            const playerStore = (await import("@/stores/player")).usePlayerStore();
            const player = playerStore.getPlayer();

            if (!player) {
                return;
            }

            if (isPresenter) {
                return;
            }

            if (slideId === playerStore.getActiveSlide()?.id) {
                player.getDraw().applyData(content);
                return;
            }

            playerStore.synchronizeDrawData(slideId, content);
        });
        communicator.socket.on("joinedPlayerRoom", () => {
            this.joinedResolve();
        });
        communicator.socket.on("blockMessage", async ({message, blockId, clientId}: {
            message: string,
            blockId: string,
            clientId?: string
        }) => {
            console.log("blockMessage", message, blockId, clientId);
            const player = (await import("@/stores/player")).usePlayerStore().getPlayer();

            if (!player) {
                return;
            }

            const block = player.getBlockById(blockId);

            if (!block) {
                return;
            }

            block.processEvent(BlockEvent.MESSAGE, {
                message,
                clientId
            });
        });
        communicator.socket.on("watcherJoinedPlayerRoom", (id) => {
            this.watchers.add(id);
        });
        communicator.socket.on("watcherLeftPlayerRoom", (id) => {
            this.watchers.delete(id);
        });
    }

    public getWatcherCount() {
        return this.watchers.size;
    }

    public changeSlide(slideId: string) {
        communicator.socket.emit("changeSlide", {slideId});
    }

    public destroy() {
        communicator.socket.emit("leavePlayerMaterialRoom", this.material.id);
    }

    public synchronizeDraw(content: string) {
        communicator.socket.emit("synchronizeDraw", {content});
    }

    public sendBlockMessage(message: string, blockId: string) {
        if (this.isPresenter) {
            communicator.socket.emit("sendBlockMessageToAttendees", {
                message,
                blockId
            });
        } else {
            communicator.socket.emit("sendBlockMessage", {
                message,
                blockId
            });
        }
    }

    getSlideId(): string {
        return this.slideId;
    }
    getCode(): string {
        return this.code;
    }
    getMaterial(): Material {
        return this.material;
    }
    
    // changeCanvas(param: { position: { x: number; y: number }; scale: number }) {
    //     communicator.socket.emit("changeCanvas", param);
    // }
}
