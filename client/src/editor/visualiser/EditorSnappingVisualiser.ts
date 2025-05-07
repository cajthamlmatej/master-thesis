import type Editor from "@/editor/Editor";
import {getRotatedRectanglePoints} from "@/utils/spaceManipulation";

/**
 * Visualizes snapping lines in the editor to assist with block alignment.
 */
export default class EditorSnappingVisualiser {
    private editor: Editor;

    private element!: HTMLElement;
    private lines: {
        horizontal: Set<number>,
        vertical: Set<number>
    } = {
        horizontal: new Set(),
        vertical: new Set()
    };

    /**
     * Initializes the snapping visualizer for the editor.
     * @param editor The editor instance.
     */
    constructor(editor: Editor) {
        this.editor = editor;

        this.editor.events.BLOCK_POSITION_CHANGED.on(() => this.recalculate());
        this.editor.events.BLOCK_ROTATION_CHANGED.on(() => this.recalculate());
        this.editor.events.BLOCK_ADDED.on(() => this.recalculate());
        this.editor.getSelector().events.SELECTED_BLOCK_CHANGED.on(() => {
            this.recalculate();

            if (this.editor.getSelector().getSelectedBlocks().length <= 0) {
                this.processVisibility(false);
            }
        });

        const snappingElement = document.createElement("div");
        snappingElement.classList.add("editor-snapping");
        snappingElement.classList.add("editor-snapping--hidden");

        this.editor.getEditorElement().appendChild(snappingElement);

        this.element = snappingElement;
        this.recalculate();
    }

    /**
     * Returns the current snapping lines.
     * @returns An object containing horizontal and vertical snapping lines.
     */
    public getLines() {
        return this.lines;
    }

    /**
     * Recalculates the snapping lines based on the current blocks in the editor.
     */
    public recalculate() {
        const selectedBlocks = this.editor.getSelector().getSelectedBlocks();
        const blockToConsider = this.editor.getBlocks().filter(b => !selectedBlocks.includes(b));

        // Clear previous points
        this.lines.horizontal.clear();
        this.lines.vertical.clear();

        for (const block of blockToConsider) {
            const boundingBox = getRotatedRectanglePoints(block.position.x, block.position.y, block.size.width, block.size.height, block.rotation);

            this.lines.vertical.add(boundingBox[0].x);
            this.lines.vertical.add(boundingBox[1].x);
            this.lines.vertical.add(boundingBox[2].x);
            this.lines.vertical.add(boundingBox[3].x);
            this.lines.horizontal.add(boundingBox[0].y);
            this.lines.horizontal.add(boundingBox[1].y);
            this.lines.horizontal.add(boundingBox[2].y);
            this.lines.horizontal.add(boundingBox[3].y);
        }

        this.redraw();
    }

    /**
     * Toggles the visibility of the snapping lines.
     * @param visible Whether the snapping lines should be visible.
     */
    public processVisibility(visible: boolean) {
        if (visible) {
            this.element.classList.remove("editor-snapping--hidden");
        } else {
            this.element.classList.add("editor-snapping--hidden");
        }
    }

    /**
     * Redraws the snapping lines in the editor.
     */
    public redraw() {
        const lines = this.element.querySelectorAll(".line");

        {
            const verticalLines = [...lines].filter(l => l.classList.contains("line--vertical"));
            const toHandle = [...this.lines.vertical.values()];

            for (const line of verticalLines) {
                const lineInToHandle = toHandle.find(p => p === parseFloat(line.getAttribute("data-x")!));

                if (!lineInToHandle) {
                    line.remove();
                } else {
                    toHandle.splice(toHandle.indexOf(lineInToHandle), 1);
                }
            }

            for (const point of toHandle) {
                const line = document.createElement("div");
                line.classList.add("line", "line--vertical");
                line.setAttribute("data-x", point.toString());
                line.style.setProperty("--x", `${point}px`);
                this.element.appendChild(line);
            }
        }

        {
            const horizontalLines = [...lines].filter(l => l.classList.contains("line--horizontal"));
            const toHandle = [...this.lines.horizontal.values()];

            for (const line of horizontalLines) {
                const lineInToHandle = toHandle.find(p => p === parseFloat(line.getAttribute("data-y")!));

                if (!lineInToHandle) {
                    line.remove();
                } else {
                    toHandle.splice(toHandle.indexOf(lineInToHandle), 1);
                }
            }

            for (const point of toHandle) {
                const line = document.createElement("div");
                line.classList.add("line", "line--horizontal");
                line.setAttribute("data-y", point.toString());
                line.style.setProperty("--y", `${point}px`);
                this.element.appendChild(line);
            }
        }
    }

}
