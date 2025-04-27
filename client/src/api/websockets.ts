import {io, Socket} from "socket.io-client";
import {useAuthenticationStore} from "@/stores/authentication";
import Material from "@/models/Material";
import {EditorCommunicator} from "@/api/editorCommunicator";
import {PlayerCommunicator} from "@/api/playerCommunicator";
import Event from "@/utils/Event";

export class WebSocketCommunicator {
    public socket: Socket;
    private resolveReadyPromise: () => void;
    public readyPromise: Promise<void> = new Promise<void>((resolve) => this.resolveReadyPromise = resolve);
    public DISCONNECTED = new Event<void>();

    constructor() {
    }

    public initialize() {
        const token = useAuthenticationStore().token;
        const shouldSkipAuth = !token || token === "null" || token === "undefined" || token === null;

        this.socket = io(import.meta.env.VITE_API ?? "", {
            auth: {
                Authorization: shouldSkipAuth ? undefined : `Bearer ${token}`,
            },
            transports: ['websocket'],
        });

        this.socket.on("connect", () => {
            this.resolveReadyPromise();
        });
        this.socket.on("disconnect", () => {
            this.DISCONNECTED.emit();
        });
        this.socket.on("newThumbnails", async({ materialId, slides }: {materialId: string, slides: {id: string, thumbnail: string}[]}) => {
            const editorStore = (await import("@/stores/editor")).useEditorStore();
            const materialStore = (await import("@/stores/material")).useMaterialStore();

            if(materialStore.currentMaterial!.id !== materialId) {
                return;
            }

            for(let slideData of slides) {
                const slide = editorStore.getSlideById(slideData.id);

                if(!slide) return;

                slide.thumbnail = slideData.thumbnail;
            }
        });
    }

    private editorRoom: EditorCommunicator | undefined;
    async setupEditorRoom(material: Material) {
        await this.readyPromise;

        if(this.editorRoom) {
            this.editorRoom.destroy();
            this.editorRoom = undefined;
        }

        this.editorRoom = new EditorCommunicator(material);

        return this.editorRoom;
    }

    public getEditorRoom() {
        return this.editorRoom;
    }

    async leaveEditorRoom(material: Material) {
        await this.readyPromise;

        if(this.editorRoom) {
            this.editorRoom.destroy();
            this.editorRoom = undefined;
        }
    }

    private playerRoom: PlayerCommunicator | undefined;

    async setupPlayerRoom(material: Material, code: string, isPresenter: boolean, slideId: string) {
        await this.readyPromise;

        if(this.playerRoom) {
            this.playerRoom.destroy();
            this.playerRoom = undefined;
        }

        this.playerRoom = new PlayerCommunicator(material, code, isPresenter, slideId);

        return this.playerRoom;
    }

    public getPlayerRoom() {
        return this.playerRoom;
    }
}

export const communicator = new WebSocketCommunicator();
