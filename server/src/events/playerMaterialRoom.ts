import {HydratedDocument} from "mongoose";
import {Material} from "../materials/material.schema";
import {Socket} from "socket.io";
import {WsException} from "@nestjs/websockets";
import {EventsGateway} from "./events.gateway";

/**
 * Manages a player material room, allowing a presenter to share slides and drawings
 * with attendees and synchronize their interactions in real-time.
 */
export class PlayerMaterialRoom {
    private material: HydratedDocument<Material>;
    private readonly roomId: string;
    private readonly gateway: EventsGateway;
    private readonly code: string;
    private readonly presenter: Socket;
    private slideId: string;
    private drawings: Map<string, string> = new Map();

    /**
     * Initializes a new PlayerMaterialRoom instance.
     * @param material The material document associated with the room.
     * @param gateway The events gateway for communication.
     * @param code The unique code for the room.
     * @param presenter The socket of the presenter.
     */
    constructor(material: HydratedDocument<Material>, gateway: EventsGateway, code: string, presenter: Socket) {
        this.material = material;
        this.gateway = gateway;
        this.roomId = `player-material-${material.id}-${code}`;
        this.code = code;
        this.presenter = presenter;

        presenter.join(this.roomId);
        presenter.on('disconnect', () => {
            this.removeListener(presenter);
        });
        presenter.emit('joinedPlayerRoom');
    }

    /**
     * Adds a listener (attendee) to the room and synchronizes the current state.
     * @param listener The socket of the listener to add.
     */
    public addListener(listener: Socket) {
        listener.join(this.roomId);
        listener.on('disconnect', () => {
            this.removeListener(listener);
        })
        listener.emit('joinedPlayerRoom');
        listener.emit('changeSlide', {
            slideId: this.slideId,
        });
        for (let drawing of this.drawings.keys()) {
            listener.emit('synchronizeDraw', {
                slideId: drawing,
                content: this.drawings.get(drawing)
            });
        }

        this.presenter.emit("watcherJoinedPlayerRoom", listener.id);
    }

    /**
     * Removes a listener (attendee) from the room. If the presenter disconnects,
     * notifies all attendees and removes the room.
     * @param client The socket of the client to remove.
     */
    public removeListener(client: Socket) {
        if (this.presenter === client) {
            this.gateway.server.to(this.roomId).emit('presenterDisconnected');
            this.gateway.removePlayerMaterialRoom(this);
            return;
        }

        client.leave(this.roomId);

        this.presenter.emit("watcherLeftPlayerRoom", client.id);
    }

    /**
     * Retrieves the unique code of the room.
     * @returns The room code.
     */
    getCode() {
        return this.code;
    }

    /**
     * Retrieves the ID of the associated material.
     * @returns The material ID.
     */
    getMaterialId() {
        return this.material.id;
    }

    /**
     * Checks if the given socket belongs to the presenter.
     * @param socket The socket to check.
     * @returns True if the socket is the presenter's, otherwise false.
     */
    isPresenter(socket: Socket) {
        return this.presenter === socket;
    }

    /**
     * Changes the current slide in the room and notifies all attendees.
     * @param slideId The ID of the slide to change to.
     * @throws WsException if the slide is not found.
     */
    changeSlide(slideId: string) {
        const slide = this.material.slides.find(s => s.id === slideId);

        if (!slide) {
            throw new WsException("Slide not found");
        }

        this.slideId = slideId;

        this.gateway.server.to(this.roomId).emit('changeSlide', {
            slideId: slideId,
        });
    }

    /**
     * Synchronizes drawing content for the current slide and broadcasts it to all attendees.
     * @param content The drawing content to synchronize.
     */
    synchronizeDraw(content: string) {
        this.drawings.set(this.slideId, content);
        this.gateway.server.to(this.roomId).emit('synchronizeDraw', {
            slideId: this.slideId,
            content: content
        });
    }

    /**
     * Sends a block-specific message from the presenter to a specific client.
     * @param client The client socket to send the message to.
     * @param message The message content.
     * @param blockId The ID of the block associated with the message.
     */
    sendBlockMessage(client: Socket, message: string, blockId: string) {
        this.presenter.emit('blockMessage', {
            message: message,
            blockId: blockId,
            clientId: client.id
        });
    }

    /**
     * Sends a block-specific message from a client to all other attendees in the room.
     * @param client The client socket sending the message.
     * @param message The message content.
     * @param blockId The ID of the block associated with the message.
     */
    sendBlockMessageToAttendees(client: Socket, message: string, blockId: string) {
        client.to(this.roomId).emit('blockMessage', {
            message: message,
            blockId: blockId
        });
    }
}