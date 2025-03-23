import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsException
} from '@nestjs/websockets';
import {Server, Socket} from 'socket.io';
import {forwardRef, Inject, UseGuards} from "@nestjs/common";
import {WSOptionalAuthenticationGuard} from "../auth/auth.guard";
import {HydratedDocument} from "mongoose";
import {Material} from "../materials/material.schema";
import {MaterialsService} from "../materials/materials.service";
import {MaterialsExportService} from "../materials/materialsExport.service";
import generateToken from "../utils/generateToken";

export class EditorMaterialRoomAttendee {
    public readonly client: Socket;
    public readonly room: EditorMaterialRoom;

    public color: string;
    public name: string;

    public slideId: string;
    public selectedBlocks: string[] = [];

    constructor(client: Socket, room: EditorMaterialRoom) {
        this.client = client;
        this.slideId = room.getMaterial().slides[0]?.id ?? null;
        this.name = client.data.user?.name ?? 'Anonymous';
        this.color = "#" + generateToken(6, "0123456789ABCDEF");
    }

    public changeSlide(slideId: string) {
        this.slideId = slideId;
        this.selectedBlocks = [];
    }
}

export class EditorMaterialRoom {
    private material: HydratedDocument<Material>;
    private readonly roomId: string;
    private readonly gateway: EventsGateway;
    private debounceThumbnail: NodeJS.Timeout;

    private attendees: EditorMaterialRoomAttendee[] = [];
    private debounceMaterial: NodeJS.Timeout;

    constructor(material: HydratedDocument<Material>, gateway: EventsGateway) {
        this.material = material;
        this.gateway = gateway;
        this.roomId = `editor-material-${material.id}`;
        this.attendees = [];
    }

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

    public removeListener(client: Socket) {
        client.leave(this.roomId);
        this.attendees = this.attendees.filter(a => a.client !== client);

        this.gateway.server.to(this.roomId).emit('removeAttendee', {
            id: client.id
        });
    }

    public getMaterialId() {
        return this.material.id;
    }

    public getMaterial() {
        return this.material;
    }

    public getAttendee(client: Socket) {
        return this.attendees.find(a => a.client === client);
    }

    public announceNewThumbnails(slides: {
        id: string,
        thumbnail: string
    }[]) {
        this.gateway.server.to(this.roomId).emit('newThumbnails', {
            materialId: this.material.id,
            slides: slides
        });
    }

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

    public async removeSlide({slideId}: { slideId: string }) {
        this.material.slides = this.material.slides.filter(s => s.id !== slideId);

        this.gateway.server.to(this.roomId).emit('removeSlide', {
            slideId: slideId
        });

        this.material.markModified("slides");
        this.saveMaterial();
    }

    public generateThumbnail() {
        if (this.debounceThumbnail) {
            clearTimeout(this.debounceThumbnail);
        }

        this.debounceThumbnail = setTimeout(async () => {
            await this.gateway.materialsExportService.exportSlideThumbnails(this.material);
        }, 3000);
    }

    private saveMaterial() {
        if (this.debounceMaterial) {
            clearTimeout(this.debounceMaterial);
        }

        this.debounceMaterial = setTimeout(async () => {
            await this.material.save();
        }, 3000);
    }

    private async saveSlide(slideId: string) {
        this.generateThumbnail();
        this.material.markModified("slides");
        this.saveMaterial();
    }

    private getSlide(slideId: string) {
        const slide = this.material.slides.find(s => s.id === slideId);

        if (!slide) {
            return undefined;
        }

        return slide;
    }

    private async removeSlideBlock(slideId: string, blockId: string) {
        const slide = this.getSlide(slideId);

        if (!slide) return;

        slide.data.blocks = slide.data.blocks.filter(b => b.id !== blockId);
    }

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
}

@UseGuards(WSOptionalAuthenticationGuard)
@WebSocketGateway({
    cors: {
        origin: '*',
    },
    transports: ['websocket'],
    allowEIO3: false,
    serveClient: false,
})
export class EventsGateway {
    @WebSocketServer()
    server: Server;
    private editorRooms: EditorMaterialRoom[] = [];

    constructor(
        public readonly materialsService: MaterialsService,
        @Inject(forwardRef(() => MaterialsExportService)) public readonly materialsExportService: MaterialsExportService,
    ) {
    }

    @SubscribeMessage('joinEditorMaterialRoom')
    public async handleJoinEditor(@MessageBody() materialId: string, @ConnectedSocket() client: Socket) {
        let room = this.editorRooms.find(r => r.getMaterialId() === materialId);

        if (client.data.editorRoom !== null) {
            const oldRoom = client.data.editorRoom as EditorMaterialRoom;

            if (oldRoom) {
                oldRoom.removeListener(client);
            }
        }

        if (!room) {
            const material = await this.materialsService.findById(materialId);

            if (!material) {
                throw new WsException("Material not found");
            }

            // TODO: Has access?

            const newRoom = new EditorMaterialRoom(material, this);
            newRoom.addListener(client);
            this.editorRooms.push(newRoom);
            room = newRoom;
        } else {
            room.addListener(client);
        }

        client.data.editorRoom = room;
        console.log(`Client ${client.id} joined editor room ${materialId}`);
    }

    @SubscribeMessage('changeSlide')
    public async handleChangeSlide(@MessageBody() {slideId}: { slideId: string }, @ConnectedSocket() client: Socket) {
        const editorRoom = client.data.editorRoom as EditorMaterialRoom | undefined;

        if (!editorRoom) {
            throw new WsException("You are not in the editor room");
        }

        editorRoom.changeAttendeeSlide(client, slideId);
    }

    @SubscribeMessage('changeSelectedBlocks')
    public async handleChangeSelectedBlocks(@MessageBody() {selectedBlocks}: {
        selectedBlocks: string[]
    }, @ConnectedSocket() client: Socket) {
        const editorRoom = client.data.editorRoom as EditorMaterialRoom | undefined;

        if (!editorRoom) {
            throw new WsException("You are not in the editor room");
        }

        editorRoom.changeAttendeeSelectedBlocks(client, selectedBlocks);
    }

    @SubscribeMessage('synchronizeBlock')
    public async handleSynchronizeBlock(@MessageBody() {block}: { block: any }, @ConnectedSocket() client: Socket) {
        const editorRoom = client.data.editorRoom as EditorMaterialRoom | undefined;

        if (!editorRoom) {
            throw new WsException("You are not in the editor room");
        }

        editorRoom.synchronizeBlock(client, block);
    }

    @SubscribeMessage('removeBlock')
    public async handleRemoveBlock(@MessageBody() {blockId}: { blockId: string }, @ConnectedSocket() client: Socket) {
        const editorRoom = client.data.editorRoom as EditorMaterialRoom | undefined;

        if (!editorRoom) {
            throw new WsException("You are not in the editor room");
        }

        editorRoom.removeBlock(client, blockId);
    }

    @SubscribeMessage('synchronizeMaterial')
    public async handleSynchronizeMaterial(@MessageBody() data: {
        plugins: { plugin: string; release: string }[];
        name: string;
        method: "AUTOMATIC" | "MANUAL" | "INTERACTIVITY";
        automaticTime: number;
        sizing: "FIT_TO_SCREEN" | "MOVEMENT";
        visibility: "PUBLIC" | "PRIVATE"
    }, @ConnectedSocket() client: Socket) {
        const editorRoom = client.data.editorRoom as EditorMaterialRoom | undefined;

        if (!editorRoom) {
            throw new WsException("You are not in the editor room");
        }

        editorRoom.synchronizeMaterial(data);
    }

    @SubscribeMessage('synchronizeSlide')
    public async handleSynchronizeSlide(@MessageBody() data: {
        slideId: string;
        size: { width: number; height: number };
        color: string;
        position: number
    }, @ConnectedSocket() client: Socket) {
        const editorRoom = client.data.editorRoom as EditorMaterialRoom | undefined;

        if (!editorRoom) {
            throw new WsException("You are not in the editor room");
        }

        editorRoom.synchronizeSlide(data);
    }

    @SubscribeMessage('removeSlide')
    public async handleRemoveSlide(@MessageBody() {slideId}: { slideId: string }, @ConnectedSocket() client: Socket) {
        const editorRoom = client.data.editorRoom as EditorMaterialRoom | undefined;

        if (!editorRoom) {
            throw new WsException("You are not in the editor room");
        }

        editorRoom.removeSlide({slideId});
    }

    @SubscribeMessage('leaveEditorMaterialRoom')
    public async handleLeaveEditor(@ConnectedSocket() client: Socket) {
        const room = client.data.editorRoom as EditorMaterialRoom | undefined;

        if (room) {
            room.removeListener(client);
            client.data.editorRoom = null;
        }
    }

    public getEditorRoom(id: any) {
        return this.editorRooms.find(r => r.getMaterialId() === id);
    }
}
