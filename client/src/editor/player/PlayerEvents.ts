import Event from "@/utils/Event";
import {PlayerMode} from "@/editor/player/PlayerMode";

/**
 * The PlayerEvents class defines custom events used by the Player.
 * These events allow communication between different components of the Player.
 */
export default class PlayerEvents {

    /** Event triggered when the Player mode changes. */
    public MODE_CHANGED = new Event<PlayerMode>();

    /** Event triggered when the canvas is repositioned. */
    public CANVAS_REPOSITION = new Event<void>();

    /** Event triggered when the Player has finished loading. */
    public LOADED = new Event<void>();

    /** Event triggered when the Player is destroyed. */
    public PLAYER_DESTROYED = new Event<void>();
};
