import Event from "@/utils/Event";
import {EditorBlock} from "@/editor/block/EditorBlock";

/**
 * Handles events related to the editor's selection functionality.
 */
export default class EditorSelectorEvents {

    /**
     * Event triggered when the selected blocks change.
     * Subscribers receive an array of the currently selected EditorBlock objects.
     */
    public SELECTED_BLOCK_CHANGED = new Event<EditorBlock[]>();

    /**
     * Event triggered when the selection area changes.
     * Subscribers receive an object containing the x and y coordinates, width, height, and rotation of the area.
     */
    public AREA_CHANGED = new Event<{ x: number, y: number, width: number, height: number, rotation: number }>();

}
