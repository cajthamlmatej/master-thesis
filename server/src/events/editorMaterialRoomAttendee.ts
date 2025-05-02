import {Socket} from "socket.io";
import {EditorMaterialRoom} from "./editorMaterialRoom";
import generateToken from "../utils/generateToken";

/**
 * Represents an attendee in an editor material room.
 * Each attendee is associated with a client socket and a room.
 */
export class EditorMaterialRoomAttendee {
    public readonly client: Socket;
    public readonly room: EditorMaterialRoom;

    public color: string;
    public name: string;

    public slideId: string;
    public selectedBlocks: string[] = [];

    /**
     * Creates an instance of EditorMaterialRoomAttendee.
     * @param client - The socket client associated with the attendee.
     * @param room - The editor material room the attendee belongs to.
     */
    constructor(client: Socket, room: EditorMaterialRoom) {
        this.client = client;
        this.slideId = room.getMaterial().slides[0]?.id ?? null;
        this.name = client.data.user?.name ?? 'Anonymous';
        this.color = "#" + generateToken(6, "0123456789ABCDEF");
    }

    /**
     * Changes the current slide for the attendee.
     * Resets the selected blocks when the slide is changed.
     * @param slideId - The ID of the new slide to switch to.
     */
    public changeSlide(slideId: string) {
        this.slideId = slideId;
        this.selectedBlocks = [];
    }
}