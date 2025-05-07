import {Document, HydratedDocument, Types} from "mongoose";
import {Material} from "../materials/material.schema";
import {DefaultEventsMap, Socket} from "socket.io";
import {WsException} from "@nestjs/websockets";
import {EventsGateway} from "./events.gateway";
import {EditorMaterialRoomAttendee} from "./editorMaterialRoomAttendee";
import { User, UserDocument } from "src/users/user.schema";

/**
 * Represents a room for editing a material collaboratively.
 * Manages attendees, material synchronization, and slide/block operations.
 */
export class EditorMaterialRoom {
    private material: HydratedDocument<Material>;
    private readonly roomId: string;
    private readonly gateway: EventsGateway;
    private debounceThumbnail: NodeJS.Timeout;

    private attendees: EditorMaterialRoomAttendee[] = [];
    private debounceMaterial: NodeJS.Timeout;

    /**
     * Initializes the editor material room with the given material and gateway.
     * @param material The material document to be edited.
     * @param gateway The events gateway for communication.
     */
    constructor(material: HydratedDocument<Material>, gateway: EventsGateway) {
        this.material = material;
        this.gateway = gateway;
        this.roomId = `editor-material-${material.id}`;
        this.attendees = [];
        this.generateThumbnail();
    }

    /**
     * Adds a listener (attendee) to the room.
     * @param listener The socket of the attendee to add.
     */
    public addListener(listener: Socket) {
        listener.join(this.roomId);

        const attendee = new EditorMaterialRoomAttendee(listener, this);
        this.attendees.push(attendee);

        this.gateway.server.to(this.roomId).emit('newAttendee', {
            id: listener.id,
            name: attendee.name,
            color: attendee.color,
            slideId: attendee.slideId,
            selectedBlocks: attendee.selectedBlocks
        });

        // Send (to this new client) all the attendees
        this.attendees.forEach(a => {
            listener.emit('newAttendee', {
                id: a.client.id,
                name: a.name,
                color: a.color,
                slideId: a.slideId,
                selectedBlocks: a.selectedBlocks
            });
        });

        listener.on('disconnect', () => {
            this.removeListener(listener);
        });
    }

    /**
     * Removes a listener (attendee) from the room.
     * @param client The socket of the attendee to remove.
     */
    public removeListener(client: Socket) {
        client.leave(this.roomId);
        this.attendees = this.attendees.filter(a => a.client !== client);

        this.gateway.server.to(this.roomId).emit('removeAttendee', {
            id: client.id
        });
    }

    /**
     * Gets the ID of the material being edited.
     * @returns The material ID.
     */
    public getMaterialId() {
        return this.material.id;
    }

    /**
     * Gets the material document being edited.
     * @returns The material document.
     */
    public getMaterial() {
        return this.material;
    }

    /**
     * Retrieves an attendee by their socket.
     * @param client The socket of the attendee.
     * @returns The attendee or undefined if not found.
     */
    public getAttendee(client: Socket) {
        return this.attendees.find(a => a.client === client);
    }

    /**
     * Announces new thumbnails for slides to all attendees.
     * @param slides The slides with their new thumbnails.
     */
    public announceNewThumbnails(slides: {
        id: string,
        thumbnail: string
    }[]) {
        this.gateway.server.to(this.roomId).emit('newThumbnails', {
            materialId: this.material.id,
            slides: slides
        });
    }

    /**
     * Changes the slide currently being viewed by an attendee.
     * @param client The socket of the attendee.
     * @param slideId The ID of the slide to switch to.
     * @throws WsException if the attendee is not in the room.
     */
    public changeAttendeeSlide(client: Socket, slideId: string) {
        const attendee = this.getAttendee(client);

        if (!attendee) {
            throw new WsException("You are not in the editor room");
        }

        attendee.changeSlide(slideId);

        this.gateway.server.to(this.roomId).emit('changeSlide', {
            id: client.id,
            slideId: slideId
        });
    }

    /**
     * Updates the blocks selected by an attendee.
     * @param client The socket of the attendee.
     * @param selectedBlocks The IDs of the selected blocks.
     * @throws WsException if the attendee is not in the room.
     */
    public changeAttendeeSelectedBlocks(client: Socket, selectedBlocks: string[]) {
        const attendee = this.getAttendee(client);

        if (!attendee) {
            throw new WsException("You are not in the editor room");
        }

        attendee.selectedBlocks = selectedBlocks;

        this.gateway.server.to(this.roomId).emit('changeSelectedBlocks', {
            id: client.id,
            selectedBlocks: selectedBlocks
        });
    }

    /**
     * Synchronizes a block's data across all attendees.
     * @param client The socket of the attendee making the change.
     * @param block The block data to synchronize.
     */
    public async synchronizeBlock(client: Socket, block: any) {
        const slideId = this.getAttendee(client)!.slideId;
        this.gateway.server.to(this.roomId).emit('synchronizeBlock', {
            slideId: slideId,
            block: block,
            author: client.id
        });

        await this.synchronizeSlideBlock(slideId, block);
        await this.saveSlide(slideId);
    }

    /**
     * Removes a block from a slide and notifies all attendees.
     * @param client The socket of the attendee making the change.
     * @param blockId The ID of the block to remove.
     */
    public async removeBlock(client: Socket, blockId: string) {
        const slideId = this.getAttendee(client)!.slideId;
        this.gateway.server.to(this.roomId).emit('removeBlock', {
            slideId: slideId,
            author: client.id,
            blockId: blockId
        });

        await this.removeSlideBlock(slideId, blockId);
        await this.saveSlide(slideId);
    }

    /**
     * Synchronizes the material's metadata and settings.
     * @param data The updated material data.
     */
    public synchronizeMaterial(data: {
        plugins: { plugin: string; release: string }[];
        name: string;
        method: "AUTOMATIC" | "MANUAL" | "INTERACTIVITY";
        automaticTime: number;
        sizing: "FIT_TO_SCREEN" | "MOVEMENT";
        visibility: "PUBLIC" | "PRIVATE"
    }) {
        this.material.name = data.name;
        this.material.plugins = data.plugins as any;
        this.material.method = data.method;
        this.material.automaticTime = data.automaticTime;
        this.material.sizing = data.sizing;
        this.material.visibility = data.visibility;

        this.gateway.server.to(this.roomId).emit('synchronizeMaterial', data);
    }

    /**
     * Synchronizes a slide's data across all attendees.
     * @param data The updated slide data.
     */
    public async synchronizeSlide(data: {
        slideId: string;
        size: { width: number; height: number };
        color: string;
        position: number
    }) {
        this.gateway.server.to(this.roomId).emit('synchronizeSlide', data);

        let slide = this.getSlide(data.slideId);

        if (!slide) {
            const newSlide = {
                id: data.slideId,
                thumbnail: "",
                position: data.position,
                data: {
                    editor: {
                        size: data.size,
                        color: data.color
                    },
                    blocks: []
                }
            }

            this.material.slides.push(newSlide);
            slide = newSlide;
        }

        slide.data.editor.size = data.size;
        slide.data.editor.color = data.color;
        slide.position = data.position;

        await this.saveSlide(data.slideId);
    }

    /**
     * Removes a slide from the material and notifies all attendees.
     * @param slideId The ID of the slide to remove.
     */
    public async removeSlide({slideId}: { slideId: string }) {
        this.material.slides = this.material.slides.filter(s => s.id !== slideId);

        this.gateway.server.to(this.roomId).emit('removeSlide', {
            slideId: slideId
        });

        this.material.markModified("slides");
        this.saveMaterial();
    }

    /**
     * Generates thumbnails for the material's slides.
     * Debounced to avoid frequent calls.
     */
    public generateThumbnail() {
        if (this.debounceThumbnail) {
            clearTimeout(this.debounceThumbnail);
        }

        this.debounceThumbnail = setTimeout(async () => {
            await this.gateway.materialsExportService.exportSlideThumbnails(this.material);
        }, 3000);
    }

    /**
     * Saves the material document to the database.
     * Debounced to avoid frequent saves.
     */
    private saveMaterial() {
        if (this.debounceMaterial) {
            clearTimeout(this.debounceMaterial);
        }

        this.debounceMaterial = setTimeout(async () => {
            try {
                this.material.updatedAt = new Date();
                await this.material.save();
            } catch (e) {
                console.error("Unable to save material", e);
            }
        }, 3000);
    }

    /**
     * Saves a specific slide's data to the material.
     * @param slideId The ID of the slide to save.
     */
    private async saveSlide(slideId: string) {
        this.generateThumbnail();
        this.material.markModified("slides");
        this.saveMaterial();
    }

    /**
     * Retrieves a slide by its ID.
     * @param slideId The ID of the slide to retrieve.
     * @returns The slide or undefined if not found.
     */
    private getSlide(slideId: string) {
        const slide = this.material.slides.find(s => s.id === slideId);

        if (!slide) {
            return undefined;
        }

        return slide;
    }

    /**
     * Removes a block from a slide's data.
     * @param slideId The ID of the slide.
     * @param blockId The ID of the block to remove.
     */
    private async removeSlideBlock(slideId: string, blockId: string) {
        const slide = this.getSlide(slideId);

        if (!slide) return;

        slide.data.blocks = slide.data.blocks.filter(b => b.id !== blockId);
    }

    /**
     * Synchronizes a block's data within a slide.
     * Adds the block if it doesn't exist, or updates it if it does.
     * @param slideId The ID of the slide.
     * @param blockData The block data to synchronize.
     */
    private async synchronizeSlideBlock(slideId: string, blockData: any) {
        const slide = this.getSlide(slideId)
        const block = JSON.parse(blockData);

        if (!slide) return;

        const existingBlock = slide.data.blocks.find(b => b.id === block.id);

        if (!existingBlock) {
            slide.data.blocks.push(block);
        } else {
            slide.data.blocks = slide.data.blocks.map(b => b.id === block.id ? block : b);
        }
    }

    /**
     * Checks if a client can join the room (if its not full, etc).
     * @param client The socket of the client to check.
     */
    canJoin(client: Socket) {
        const user = client.data.user!;

        if(this.attendees.length < 10) {
            return true;
        }

        if(this.material.user.toString() === user._id.toString()) {
            return true;
        }

        return false;
    }

    checkAttendees(newAttendees: (string)[]) {
        for(const attendee of this.attendees) {
            const user = newAttendees.find(a => a.toString() === attendee.client.data.user!._id.toString());

            if (!user && this.material.user.toString() !== attendee.client.data.user!._id.toString()) {
                this.removeListener(attendee.client);
                attendee.client.emit("kicked");
            }
        }

        this.material.attendees = newAttendees.map(a => a.toString()) as any;
    }
}