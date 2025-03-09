import Event from "@/utils/Event";
import {PlayerMode} from "@/editor/player/PlayerMode";

export default class PlayerEvents {

    public MODE_CHANGED = new Event<PlayerMode>();
    public CANVAS_REPOSITION = new Event<void>();

};
