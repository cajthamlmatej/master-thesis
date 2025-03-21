import {
    ConnectedSocket,
    MessageBody, OnGatewayInit,
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
import {MaterialsModule} from "../materials/materials.module";
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
        this.slideId = room.getMaterial().slides[0].id ?? null;
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

        if(!attendee) {
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

        if(!attendee) {
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

        await this.saveSlide(slideId);
    }

    public async removeBlock(client: Socket, blockId: string) {
        const slideId = this.getAttendee(client)!.slideId;
        this.gateway.server.to(this.roomId).emit('removeBlock', {
            slideId: slideId,
            author: client.id,
            blockId: blockId
        });

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
        this.gateway.server.to(this.roomId).emit('synchronizeMaterial', data);
    }

    public async synchronizeSlide(data: { slideId: string; size: { width: number; height: number }; color: string }) {
        this.gateway.server.to(this.roomId).emit('synchronizeSlide', data);

        await this.saveSlide(data.slideId);
    }

    public generateThumbnail() {
        if(this.debounceThumbnail) {
            clearTimeout(this.debounceThumbnail);
        }

        this.debounceThumbnail = setTimeout(() => {
            this.gateway.materialsExportService.exportSlideThumbnails(this.material);
        }, 3000);
    }

    private async saveSlide(slideId: string) {

        this.generateThumbnail();
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
export class EventsGateway  {
    @WebSocketServer()
    server: Server;
    constructor(
        public readonly materialsService: MaterialsService,
        @Inject(forwardRef(() => MaterialsExportService)) public readonly materialsExportService: MaterialsExportService,
    ) {
    }

    private editorRooms: EditorMaterialRoom[] = [];

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

        if(!editorRoom) {
            throw new WsException("You are not in the editor room");
        }

        editorRoom.changeAttendeeSlide(client, slideId);
    }

    @SubscribeMessage('changeSelectedBlocks')
    public async handleChangeSelectedBlocks(@MessageBody() {selectedBlocks}: { selectedBlocks: string[] }, @ConnectedSocket() client: Socket) {
        const editorRoom = client.data.editorRoom as EditorMaterialRoom | undefined;

        if(!editorRoom) {
            throw new WsException("You are not in the editor room");
        }

        editorRoom.changeAttendeeSelectedBlocks(client, selectedBlocks);
    }

    @SubscribeMessage('synchronizeBlock')
    public async handleSynchronizeBlock(@MessageBody() {block}: { block: any }, @ConnectedSocket() client: Socket) {
        const editorRoom = client.data.editorRoom as EditorMaterialRoom | undefined;

        if(!editorRoom) {
            throw new WsException("You are not in the editor room");
        }

        editorRoom.synchronizeBlock(client, block);
    }

    @SubscribeMessage('removeBlock')
    public async handleRemoveBlock(@MessageBody() {blockId}: { blockId: string }, @ConnectedSocket() client: Socket) {
        const editorRoom = client.data.editorRoom as EditorMaterialRoom | undefined;

        if(!editorRoom) {
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
        visibility: "PUBLIC" | "PRIVATE" }, @ConnectedSocket() client: Socket) {
        const editorRoom = client.data.editorRoom as EditorMaterialRoom | undefined;

        if(!editorRoom) {
            throw new WsException("You are not in the editor room");
        }

        editorRoom.synchronizeMaterial(data);
    }

    @SubscribeMessage('synchronizeSlide')
    public async handleSynchronizeSlide(@MessageBody() data: {
        slideId: string;
        size: { width: number; height: number };
        color: string;
    }, @ConnectedSocket() client: Socket) {
        const editorRoom = client.data.editorRoom as EditorMaterialRoom | undefined;

        if(!editorRoom) {
            throw new WsException("You are not in the editor room");
        }

        editorRoom.synchronizeSlide(data);
    }

    // @SubscribeMessage('requestMaterialThumbnail')
    // public async handleRequestMaterialThumbnail(@MessageBody() {materialId, slideId}: { materialId: string, slideId: string }, @ConnectedSocket() client: Socket) {
    //     const room = this.getEditorRoom(materialId);
    //
    //     if (!room) {
    //         throw new WsException("You are not in the editor room");
    //     }
    //
    //     const material = await this.materialsService.findById(materialId);
    //
    //     if(!material) {
    //         throw new WsException("Material not found");
    //     }
    //
    //     this.materialsExportService.exportSlideThumbnail(material, slideId);
    // }

    public getEditorRoom(id: any) {
        return this.editorRooms.find(r => r.getMaterialId() === id);
    }
}
