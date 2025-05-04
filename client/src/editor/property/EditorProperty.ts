import Editor from "@/editor/Editor";
import type {EditorBlock} from "@/editor/block/EditorBlock";
import {Property} from "@/editor/property/Property";

/**
 * Manages the properties of editor blocks and handles their interactions.
 * This class is responsible for managing the UI and logic for displaying and interacting with properties
 * of selected editor blocks. It also handles cursor locking and updates the property display dynamically
 * based on the selected blocks.
 */
export class EditorProperty {
    private element!: HTMLElement;
    private editor: Editor;
    private activeProperties: Property[] = [];
    private cursorVisualElement!: HTMLElement;
    private propertiesElement!: HTMLElement;

    /**
     * Creates an instance of EditorProperty.
     * @param {Editor} editor - The editor instance.
     * @param {HTMLElement} element - The HTML element representing the editor property container.
     */
    constructor(editor: Editor, element: HTMLElement) {
        this.editor = editor;
        this.element = element;
        this.setup();

        this.editor.getSelector().events.SELECTED_BLOCK_CHANGED.on((blocks: EditorBlock[]) => this.update(blocks));
        this.update(this.editor.getSelector().getSelectedBlocks());
    }

    /**
     * Gets the editor instance associated with this property manager.
     * @returns {Editor} The editor instance.
     */
    public getEditor() {
        return this.editor;
    }

    /**
     * Cleans up resources and removes elements associated with the property manager.
     * This method ensures that all DOM elements created by the property manager are removed
     * and any event listeners are cleaned up to prevent memory leaks.
     */
    public destroy() {
        this.cursorVisualElement.remove();
        this.propertiesElement.remove();
        this.element.innerHTML = "";
    }

    /**
     * Locks the cursor on a specific element and tracks mouse movements for resizing or other interactions.
     * This method enables pointer lock and visually tracks the cursor's position, allowing for precise
     * interactions such as resizing or dragging elements.
     * 
     * @param {HTMLElement} element - The element to lock the cursor on.
     * @param {(changeX: number, changeY: number, distance: number) => boolean} change - A callback function to handle changes based on mouse movement.
     */
    public lockOnElement(element: HTMLElement, change: (changeX: number, changeY: number, distance: number) => boolean) {
        element.addEventListener('mousedown', (e) => {
            // Lock cursor
            element!.requestPointerLock();

            this.cursorVisualElement.classList.add('cursor-visual--active');

            this.cursorVisualElement.style.left = e.clientX + 'px';
            this.cursorVisualElement.style.top = e.clientY + 'px';

            const start = {x: e.clientX, y: e.clientY};
            const current = {x: e.clientX, y: e.clientY};

            const onMouseMove = (e: MouseEvent) => {
                // Update `current` values
                current.x += e.movementX;
                current.y += e.movementY;

                // Calculate deltas relative to start
                const deltaX = current.x - start.x;
                const deltaY = current.y - start.y;

                // Calculate distance from start
                const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

                // Try resizing blocks
                let changeSuccessful = change(deltaX, deltaY, distance);

                // Only update cursor visual if resize was successful
                if (changeSuccessful) {
                    const beforeX = parseFloat(this.cursorVisualElement.style.left);
                    const beforeY = parseFloat(this.cursorVisualElement.style.top);
                    let cappedX = (beforeX + e.movementX) % window.innerWidth;
                    let cappedY = (beforeY + e.movementY) % window.innerHeight;

                    if (cappedX < 0) {
                        cappedX = window.innerWidth + cappedX;
                    }
                    if (cappedY < 0) {
                        cappedY = window.innerHeight + cappedY;
                    }
                    this.cursorVisualElement.style.left = `${cappedX}px`;
                    this.cursorVisualElement.style.top = `${cappedY}px`;

                    // Update the start position for the next move
                    start.x = current.x;
                    start.y = current.y;
                } else {
                    // Revert `current` to the last successful position
                    current.x = start.x;
                    current.y = start.y;
                }

                e.preventDefault();
                return false;
            };

            const onMouseUp = (e: MouseEvent) => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                document.exitPointerLock();
                this.cursorVisualElement.classList.remove('cursor-visual--active');
            }

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    }

    /**
     * Sets up the initial DOM elements for the property manager.
     * This method creates and appends the necessary DOM elements, such as the cursor visual
     * and the properties container, to the appropriate locations in the document.
     */
    private setup() {
        const cursorVisual = document.createElement('div');
        cursorVisual.classList.add('cursor-visual');

        this.cursorVisualElement = cursorVisual;

        const properties = document.createElement('div');
        properties.classList.add('properties');

        this.propertiesElement = properties;

        this.element.appendChild(properties);
        // note(Matej): this has to be in document.body otherwise the calculations would be wrong
        document.body.appendChild(cursorVisual);
    }

    /**
     * Updates the properties displayed based on the selected blocks.
     * This method dynamically generates and displays the properties of the currently selected blocks
     * in the editor. It ensures that duplicate properties are removed and properties are sorted by priority.
     * 
     * @param {EditorBlock[]} blocks - The currently selected blocks.
     */
    private update(blocks: EditorBlock[]) {
        this.propertiesElement.innerHTML = "";
        if (blocks.length === 0) {
            return;
        }

        const properties = blocks
            .map(block => block.getProperties())
            .flat()
            .reduce((acc: Property[], property) => acc.some(p => p.getID() === property.getID()) ? acc : [...acc, property], [])
            .sort((a, b) => a.getPriority() - b.getPriority());

        this.activeProperties = properties;

        for (const property of properties) {
            const element = document.createElement("div");
            element.classList.add("property");
            //element.classList.add("property--type-" + (typeof property).toLowerCase().replace("property", ""));

            property.initialize(element, this, blocks);

            if (!property.isVisible()) {
                continue;
            }
            this.propertiesElement.appendChild(element);

            property.setup();
        }
    }
}
