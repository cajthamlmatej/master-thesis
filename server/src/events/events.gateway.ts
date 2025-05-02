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
    ) {}

    /**
     * Retrieves an editor room by its material ID.
     * @param id - The ID of the material.
     * @returns The corresponding EditorMaterialRoom or undefined if not found.
     */
    public getEditorRoom(id: any) {
        return this.editorRooms.find(r => r.getMaterialId() === id);
    }

    /**
     * Removes a player material room from the list of active player rooms.
     * @param param - The PlayerMaterialRoom to remove.
     */
    public removePlayerMaterialRoom(param: PlayerMaterialRoom) {
        this.playerRooms = this.playerRooms.filter(r => r !== param);
    }

    /**
     * Handles a client joining an editor material room.
     * @param materialId - The ID of the material to join.
     * @param client - The WebSocket client.
     */
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

        if (material.user.toString() !== client.data.user?._id.toString() && !material.attendees.map(a => a.toString()).includes(client.data.user?._id.toString())) {
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

    /**
     * Handles a client changing the slide in a room.
     * @param slideId - The ID of the slide to change to.
     * @param client - The WebSocket client.
     */
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

    /**
     * Handles a client changing the selected blocks in an editor room.
     * @param selectedBlocks - The IDs of the selected blocks.
     * @param client - The WebSocket client.
     */
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

    /**
     * Handles a client synchronizing a block in an editor room.
     * @param block - The block data to synchronize.
     * @param client - The WebSocket client.
     */
    @SubscribeMessage('synchronizeBlock')
    public async handleSynchronizeBlock(@MessageBody() {block}: { block: any }, @ConnectedSocket() client: Socket) {
        const editorRoom = client.data.editorRoom as EditorMaterialRoom | undefined;

        if (!editorRoom) {
            throw new WsException("You are not in the editor room");
        }

        editorRoom.synchronizeBlock(client, block);
    }

    /**
     * Handles a client removing a block in an editor room.
     * @param blockId - The ID of the block to remove.
     * @param client - The WebSocket client.
     */
    @SubscribeMessage('removeBlock')
    public async handleRemoveBlock(@MessageBody() {blockId}: { blockId: string }, @ConnectedSocket() client: Socket) {
        const editorRoom = client.data.editorRoom as EditorMaterialRoom | undefined;

        if (!editorRoom) {
            throw new WsException("You are not in the editor room");
        }

        editorRoom.removeBlock(client, blockId);
    }

    /**
     * Handles a client synchronizing material settings in an editor room.
     * @param data - The material synchronization data.
     * @param client - The WebSocket client.
     */
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

    /**
     * Handles a client synchronizing a slide in an editor room.
     * @param data - The slide synchronization data.
     * @param client - The WebSocket client.
     */
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

    /**
     * Handles a client removing a slide in an editor room.
     * @param slideId - The ID of the slide to remove.
     * @param client - The WebSocket client.
     */
    @SubscribeMessage('removeSlide')
    public async handleRemoveSlide(@MessageBody() {slideId}: { slideId: string }, @ConnectedSocket() client: Socket) {
        const editorRoom = client.data.editorRoom as EditorMaterialRoom | undefined;

        if (!editorRoom) {
            throw new WsException("You are not in the editor room");
        }

        editorRoom.removeSlide({slideId});
    }

    /**
     * Handles a client leaving an editor material room.
     * @param client - The WebSocket client.
     */
    @SubscribeMessage('leaveEditorMaterialRoom')
    public async handleLeaveEditor(@ConnectedSocket() client: Socket) {
        const room = client.data.editorRoom as EditorMaterialRoom | undefined;

        if (room) {
            room.removeListener(client);
            client.data.editorRoom = null;
        }
    }

    /**
     * Handles a client joining a player material room.
     * @param materialId - The ID of the material to join.
     * @param code - The room code.
     * @param slideId - The ID of the slide to start on.
     * @param client - The WebSocket client.
     */
    @SubscribeMessage('joinPlayerMaterialRoom')
    public async handleJoinPlayer(@MessageBody() {materialId, code, slideId}: {
        materialId: string,
        code: string,
        slideId: string
    }, @ConnectedSocket() client: Socket) {
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

            if (material.user.toString() !== client.data.user?._id.toString() && !material.attendees.map(a => a.toString()).includes(client.data.user?._id.toString())) {
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

    /**
     * Handles a presenter synchronizing drawing content in a player room.
     * @param content - The drawing content.
     * @param client - The WebSocket client.
     */
    @SubscribeMessage('synchronizeDraw')
    public async handleSynchronizeDraw(@MessageBody() {content}: {
        content: string
    }, @ConnectedSocket() client: Socket) {
        const playerRoom = client.data.playerRoom as PlayerMaterialRoom | undefined;

        if (!playerRoom) {
            throw new WsException("You are not in the player room");
        }

        if (!playerRoom.isPresenter(client)) {
            throw new WsException("You are not the presenter");
        }

        playerRoom.synchronizeDraw(content);
    }

    /**
     * Handles a client leaving a player material room.
     * @param client - The WebSocket client.
     */
    @SubscribeMessage('leavePlayerMaterialRoom')
    public async handleLeavePlayer(@ConnectedSocket() client: Socket) {
        const room = client.data.playerRoom as PlayerMaterialRoom | undefined;

        if (room) {
            room.removeListener(client);
            client.data.playerRoom = null;
        }
    }

    /**
     * Handles a client sending a message to the presenter about a specific block.
     * @param message - The message content.
     * @param blockId - The ID of the block.
     * @param client - The WebSocket client.
     */
    @SubscribeMessage('sendBlockMessage')
    public async handleSendBlockMessage(@MessageBody() {message, blockId}: {
        message: string,
        blockId: string
    }, @ConnectedSocket() client: Socket) {
        const playerRoom = client.data.playerRoom as PlayerMaterialRoom | undefined;

        if (!playerRoom) {
            throw new WsException("You are not in the player room");
        }

        if (playerRoom.isPresenter(client)) {
            throw new WsException("You are the presenter");
        }

        playerRoom.sendBlockMessage(client, message, blockId);
    }

    /**
     * Handles a presenter sending a message to attendees about a specific block.
     * @param message - The message content.
     * @param blockId - The ID of the block.
     * @param client - The WebSocket client.
     */
    @SubscribeMessage('sendBlockMessageToAttendees')
    public async handleSendBlockMessageToAttendees(@MessageBody() {message, blockId}: {
        message: string,
        blockId: string
    }, @ConnectedSocket() client: Socket) {
        const playerRoom = client.data.playerRoom as PlayerMaterialRoom | undefined;

        if (!playerRoom) {
            throw new WsException("You are not in the player room");
        }

        if (!playerRoom.isPresenter(client)) {
            throw new WsException("You are not the presenter");
        }

        playerRoom.sendBlockMessageToAttendees(client, message, blockId);
    }
}
