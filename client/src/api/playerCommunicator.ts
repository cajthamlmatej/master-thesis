import Material from "@/models/Material";
import {communicator} from "@/api/websockets";

export class PlayerCommunicator {
    private material: Material;
    private isPresenter: boolean;

    private joinedResolve: () => void;
    public readonly joined: Promise<void> = new Promise<void>((resolve) => this.joinedResolve = resolve);

    constructor(material: Material, code: string, isPresenter: boolean, slideId: string) {
        this.material = material;
        this.isPresenter = isPresenter;

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
        communicator.socket.on("presenterDisconnected", async() => {
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

    // changeCanvas(param: { position: { x: number; y: number }; scale: number }) {
    //     communicator.socket.emit("changeCanvas", param);
    // }
}
