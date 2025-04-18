import {HydratedDocument} from "mongoose";
import {Material} from "../materials/material.schema";
import {Socket} from "socket.io";
import {WsException} from "@nestjs/websockets";
import {EventsGateway} from "./events.gateway";

export class PlayerMaterialRoom {
    private material: HydratedDocument<Material>;
    private readonly roomId: string;
    private readonly gateway: EventsGateway;
    private readonly code: string;
    private readonly presenter: Socket;
    private slideId: string;
    // private position: { x: number; y: number } = { x: 0, y: 0 };
    // private scale: number = 1;

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
    }

    public removeListener(client: Socket) {
        client.leave(this.roomId);

        if (this.presenter === client) {
            this.gateway.server.to(this.roomId).emit('presenterDisconnected');
            this.gateway.removePlayerMaterialRoom(this);
        }
    }

    getCode() {
        return this.code;
    }

    getMaterialId() {
        return this.material.id;
    }

    isPresenter(socket: Socket) {
        return this.presenter === socket;
    }

    changeSlide(slideId: string) {
        const slide = this.material.slides.find(s => s.id === slideId);

        if (!slide) {
            throw new WsException("Slide not found");
        }

        this.slideId = slideId;

        this.gateway.server.to(this.roomId).emit('changeSlide', {
            slideId: slideId,
        });

        // this.changeCanvas({x: 0, y: 0}, 1);
    }

    // changeCanvas(position: { x: number; y: number }, scale: number ) {
    //     this.position = position;
    //     this.scale = scale;
    //     this.gateway.server.to(this.roomId).emit('changeCanvas', {
    //         position: position,
    //         scale: scale
    //     });
    // }

    private drawings: Map<string, string> = new Map();

    synchronizeDraw(content: string) {
        this.drawings.set(this.slideId, content);
        this.gateway.server.to(this.roomId).emit('synchronizeDraw', {
            slideId: this.slideId,
            content: content
        });
    }


    sendBlockMessage(client: Socket, message: string, blockId: string) {
        this.presenter.emit('blockMessage', {
            message: message,
            blockId: blockId,
            clientId: client.id
        });
    }

    sendBlockMessageToAttendees(client: Socket, message: string, blockId: string) {
        client.to(this.roomId).emit('blockMessage', {
            message: message,
            blockId: blockId
        });
    }
}