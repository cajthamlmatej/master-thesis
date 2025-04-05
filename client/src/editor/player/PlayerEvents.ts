import Event from "@/utils/Event";
import {PlayerMode} from "@/editor/player/PlayerMode";
import {PlayerBlock} from "@/editor/block/PlayerBlock";

export default class PlayerEvents {

    public MODE_CHANGED = new Event<PlayerMode>();
    public CANVAS_REPOSITION = new Event<void>();
    public LOADED = new Event<void>();

};
