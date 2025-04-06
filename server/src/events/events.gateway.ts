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
import {MaterialsService} from "../materials/materials.service";
import {MaterialsExportService} from "../materials/materialsExport.service";
import {EditorMaterialRoom} from "./editorMaterialRoom";
import {PlayerMaterialRoom} from "./playerMaterialRoom";

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
    private playerRooms: PlayerMaterialRoom[] = [];

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
        
        const material = await this.materialsService.findById(materialId);

        if (!material) {
            throw new WsException("Material not found");
        }

        if(material.user.toString() !== client.data.user?._id.toString() && !material.attendees.map(a => a.toString()).includes(client.data.user?._id.toString())) {
            throw new WsException("You cannot start edit this material");
        }

        if (!room) {
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
        const playerRoom = client.data.playerRoom as PlayerMaterialRoom | undefined;

        if (playerRoom) {
            if (playerRoom.isPresenter(client)) {
                playerRoom.changeSlide(slideId);
                return;
            }
        }

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
    }, @ConnectedSocket() client: Socket)
    {
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

    @SubscribeMessage('joinPlayerMaterialRoom')
    public async handleJoinPlayer(@MessageBody() {materialId, code, slideId}: {materialId: string, code: string, slideId: string}, @ConnectedSocket() client: Socket) {
        let room = this.playerRooms.find((r) => r.getCode() === code && r.getMaterialId() === materialId);

        if (client.data.playerRoom !== null) {
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

            if(material.user.toString() !== client.data.user?._id.toString() && !material.attendees.map(a => a.toString()).includes(client.data.user?._id.toString())) {
                throw new WsException("You cannot start watch in this material");
            }

            const newRoom = new PlayerMaterialRoom(material, this, code, client);
            this.playerRooms.push(newRoom);
            newRoom.changeSlide(slideId);
            room = newRoom;
        } else {
            room.addListener(client);
        }

        client.data.playerRoom = room;
        console.log(`Client ${client.id} joined player room ${materialId}`);
    }

    @SubscribeMessage('synchronizeDraw')
    public async handleSynchronizeDraw(@MessageBody() {content}: {content: string}, @ConnectedSocket() client: Socket) {
        const playerRoom = client.data.playerRoom as PlayerMaterialRoom | undefined;

        if (!playerRoom) {
            throw new WsException("You are not in the player room");
        }

        if (!playerRoom.isPresenter(client)) {
            throw new WsException("You are not the presenter");
        }

        playerRoom.synchronizeDraw(content);
    }

    //
    // @SubscribeMessage('changeCanvas')
    // public async handleChangeCanvas(@MessageBody() {position, scale}: {position: {x: number, y: number}, scale: number}, @ConnectedSocket() client: Socket) {
    //     const playerRoom = client.data.playerRoom as PlayerMaterialRoom | undefined;
    //
    //     if (!playerRoom) {
    //         throw new WsException("You are not in the player room");
    //     }
    //
    //     if (!playerRoom.isPresenter(client)) {
    //         throw new WsException("You are not the presenter");
    //     }
    //
    //     playerRoom.changeCanvas(position, scale);
    // }

    @SubscribeMessage('leavePlayerMaterialRoom')
    public async handleLeavePlayer(@ConnectedSocket() client: Socket) {
        const room = client.data.playerRoom as PlayerMaterialRoom | undefined;

        if (room) {
            room.removeListener(client);
            client.data.playerRoom = null;
        }
    }

    removePlayerMaterialRoom(param: PlayerMaterialRoom) {
        this.playerRooms = this.playerRooms.filter(r => r !== param);
    }
}
