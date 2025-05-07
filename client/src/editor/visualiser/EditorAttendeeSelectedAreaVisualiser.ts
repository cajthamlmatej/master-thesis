import type Editor from "@/editor/Editor";
import {boundingBoxOfElements} from "@/utils/Area";
import {communicator} from "@/api/websockets";

interface Area {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    name: string;
}

/**
 * Visualizes the selected areas of attendees in a collaborative editor.
 */
export default class EditorAttendeeAreaVisualiser {
    private editor: Editor;

    private element!: HTMLElement;
    private areas = new Map<string, Area>();

    /**
     * Initializes the attendee area visualizer for the editor.
     * @param editor The editor instance.
     */
    constructor(editor: Editor) {
        this.editor = editor;

        const element = document.createElement("div");
        element.classList.add("editor-attendee");

        this.editor.getEditorElement().appendChild(element);

        this.element = element;

        this.recalculate();

        communicator.getEditorRoom()?.EVENTS.ATTENDEE_SELECTED_BLOCKS_CHANGED.on(() => this.recalculate());
        communicator.getEditorRoom()?.EVENTS.ATTENDEE_SLIDES_CHANGED.on(() => this.recalculate());
        communicator.getEditorRoom()?.EVENTS.ATTENDEE_CHANGES.on(() => this.recalculate());
        communicator.getEditorRoom()?.EVENTS.BLOCK_CHANGED.on(() => this.recalculate());

        this.editor.events.BLOCK_CHANGED.on(() => this.recalculate());
        this.editor.events.BLOCK_ADDED.on(() => this.recalculate());
        this.editor.events.BLOCK_REMOVED.on(() => this.recalculate());
    }

    /**
     * Recalculates the attendee areas based on their selected blocks.
     */
    public recalculate() {
        this.areas.clear();

        const attendees = (communicator.getEditorRoom()?.getAttendeesOnCurrentSlide() ?? []).filter(a => a !== communicator.getEditorRoom()?.getCurrent());

        for (const attendee of attendees) {
            const blocks = this.editor.getBlocks().filter((b) => attendee.selectedBlocks.includes(b.id));

            const area = boundingBoxOfElements(blocks.map(b => b.element), this.editor);

            this.areas.set(attendee.id, {
                x: area.x,
                y: area.y,
                width: area.width,
                height: area.height,
                color: attendee.color,
                name: attendee.name
            });
        }

        this.visualise();
    }

    /**
     * Updates the visualization of attendee areas.
     */
    private visualise() {
        if (this.areas.size === 0) {
            this.element.innerHTML = "";
            return;
        }

        let html = "";

        for (const [_, area] of this.areas) {
            html += `<div class="area" style="left: ${area.x}px; top: ${area.y}px; width: ${area.width}px; height: ${area.height}px; --area-color: ${area.color}">
    <span>${area.name}</span>
</div>`;
        }

        this.element.innerHTML = html;
    }

}
