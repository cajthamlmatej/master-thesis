import {io, Socket} from "socket.io-client";
import {useAuthenticationStore} from "@/stores/authentication";
import Material from "@/models/Material";
import Event from "@/utils/Event";
import {EditorBlock} from "@/editor/block/EditorBlock";

export class EditorAttendee {
    public id: string;
    public name: string;
    public color: string;

    public icon: string;

    public slideId: string;
    public selectedBlocks: string[] = [];

    constructor(id: string, name: string, color: string, slideId: string, selectedBlocks: string[] = []) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.slideId = slideId;
        this.icon = name[0].toUpperCase() ?? "-";
        this.selectedBlocks = selectedBlocks;
    }
}

export class EditorCommunicator {
    public readonly EVENTS = {
        ATTENDEE_CHANGES: new Event<void>(),
        ATTENDEE_SLIDES_CHANGED: new Event<void>(),
        ATTENDEE_SELECTED_BLOCKS_CHANGED: new Event<void>(),

        SYNCHRONIZE_BLOCK: new Event<string>(),
        REMOVE_BLOCK: new Event<string>(),
    }
    private material: Material;
    private attendees: EditorAttendee[] = [];

    constructor(material: Material) {
        this.material = material;
        communicator.socket.emit("joinEditorMaterialRoom", material.id);

        this.EVENTS.ATTENDEE_CHANGES.emit();

        communicator.socket.on("newAttendee", (attendee: EditorAttendee) => {
            if(this.attendees.find((a) => a.id === attendee.id)) {
                return;
            }

            this.attendees.push(new EditorAttendee(attendee.id, attendee.name, attendee.color, attendee.slideId, attendee.selectedBlocks));
            this.EVENTS.ATTENDEE_CHANGES.emit();
        });
        communicator.socket.on("removeAttendee", ({id}: {id: string}) => {
            this.attendees = this.attendees.filter((a) => a.id !== id);
            this.EVENTS.ATTENDEE_CHANGES.emit();
        });
        communicator.socket.on("changeSlide", ({id, slideId}: {id: string, slideId: string}) => {
            const attendee = this.getAttendee(id);
            if(!attendee) return;
            attendee.slideId = slideId;
            attendee.selectedBlocks = [];
            this.EVENTS.ATTENDEE_SLIDES_CHANGED.emit();
        });
        communicator.socket.on("changeSelectedBlocks", ({id, selectedBlocks}) => {
            const attendeeObj = this.getAttendee(id);
            if(!attendeeObj) return;
            attendeeObj.selectedBlocks = selectedBlocks;
            this.EVENTS.ATTENDEE_SELECTED_BLOCKS_CHANGED.emit();
        });
        communicator.socket.on("synchronizeBlock", ({slideId, author, block}) => {
            if(this.getCurrent().slideId !== slideId) return;
            if(author === communicator.socket.id) return;

            this.EVENTS.SYNCHRONIZE_BLOCK.emit(block);
        });
        communicator.socket.on("removeBlock", ({slideId, author, blockId}) => {
            if(this.getCurrent().slideId !== slideId) {
                console.log("Slide mismatch", this.getCurrent().slideId, slideId);
                return;
            };
            if(author === communicator.socket.id) {
                console.log("Author mismatch", author, communicator.socket.id);
                return;
            }

            this.EVENTS.REMOVE_BLOCK.emit(blockId);
        });
        communicator.socket.on("synchronizeMaterial", async({plugins, name, method, automaticTime, sizing, visibility}: {
            plugins: { plugin: string; release: string }[];
            name: string;
            method: "AUTOMATIC" | "MANUAL" | "INTERACTIVITY";
            automaticTime: number;
            sizing: "FIT_TO_SCREEN" | "MOVEMENT";
            visibility: "PUBLIC" | "PRIVATE"
        }) => {
            this.material.name = name;
            this.material.method = method;
            this.material.automaticTime = automaticTime;
            this.material.sizing = sizing;
            this.material.visibility = visibility;

            const pluginStore = (await import("@/stores/plugin")).usePluginStore();
            const pluginManager = pluginStore.manager;

            for(let pluginData of plugins) {
                const pluginContext = pluginManager.getPlugin(pluginData.plugin);

                if(!pluginContext) {
                    const plugin = await pluginStore.loadOne(pluginData.plugin);

                    if(!plugin) {
                        console.error("Failed to load plugin", pluginData.plugin);
                        continue;
                    }

                    await pluginStore.addPluginToMaterial(plugin);
                    continue;
                }

                // The plugin is already loaded
            }

            for(let plugin of pluginManager.getPlugins()) {
                if(plugins.find((p) => p.plugin === plugin.getId())) {
                    continue;
                }

                await pluginStore.removePluginFromMaterial(plugin);
            }
        });

        communicator.socket.on("synchronizeSlide", async({slideId, size, color}: {
            slideId: string;
            size: { width: number; height: number };
            color: string;
        }) => {
            const editorStore = (await import("@/stores/editor")).useEditorStore();

            if(editorStore.getActiveSlide()?.id !== slideId) {
                return;
            }

            const editor = editorStore.getEditor();

            if(!editor) {
                return;
            }

            (editor as any).size = size;
            (editor as any).color = color;

            editor.update();
        });
    }

    public destroy() {
        communicator.socket.emit("leaveEditorMaterialRoom", this.material.id);
    }

    public getAttendee(id: string) {
        return this.attendees.find((a) => a.id === id);
    }
    public getAttendees() {
        return this.attendees;
    }
    public getAttendeesOnCurrentSlide() {
        const c = this.getCurrent();
        return this.attendees.filter((a) => a.slideId === c.slideId);
    }
    public getCurrent() {
        return this.attendees.find((a) => a.id === communicator.socket.id)!;
    }

    public changeSlide(slideId: string) {
        communicator.socket.emit("changeSlide", {slideId});
    }
    public changeSelectedBlocks(selectedBlocks: string[]) {
        communicator.socket.emit("changeSelectedBlocks", {selectedBlocks});
    }
    public synchronizeBlock(block: EditorBlock) {
        communicator.socket.emit("synchronizeBlock", {block: JSON.stringify(block.serialize())});
    }
    public removeBlock(block: EditorBlock) {
        communicator.socket.emit("removeBlock", {blockId: block.id});
    }
    public synchronizeMaterial(data: {
        plugins: { plugin: string; release: string }[];
        name: string;
        method: "AUTOMATIC" | "MANUAL" | "INTERACTIVITY";
        automaticTime: number;
        sizing: "FIT_TO_SCREEN" | "MOVEMENT";
        visibility: "PUBLIC" | "PRIVATE"
    }) {
        communicator.socket.emit("synchronizeMaterial", data);
    }
    public synchronizeSlide(data: {
        slideId: string;
        size: { width: number; height: number };
        color: string;
    }) {
        communicator.socket.emit("synchronizeSlide", data);
    }

    public canSelectBlock(blockId: string) {
        const attendee = this.getAttendeesOnCurrentSlide().filter((a) => a !== this.getCurrent());

        if(attendee.length === 0) {
            return true;
        }

        return !attendee.some((a) => a.selectedBlocks.includes(blockId));
    }
}

export class WebSocketCommunicator {
    public socket: Socket;
    private resolveReadyPromise: () => void;
    private readyPromise: Promise<void> = new Promise<void>((resolve) => this.resolveReadyPromise = resolve);

    constructor() {
    }

    public initialize() {
        this.socket = io("http://localhost:3000", {
            auth: {
                Authorization: "Bearer " + useAuthenticationStore().token
            },
            transports: ['websocket'],
        });

        this.socket.on("connect", () => {
            this.resolveReadyPromise();
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

    //
    // async requestMaterialThumbnail(materialId: string, slideId: string) {
    //     await this.readyPromise;
    //     this.socket.emit("requestMaterialThumbnail", {materialId, slideId});
    // }
}

export const communicator = new WebSocketCommunicator();
