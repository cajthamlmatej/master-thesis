import {Socket} from "socket.io";
import {EditorMaterialRoom} from "./editorMaterialRoom";
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