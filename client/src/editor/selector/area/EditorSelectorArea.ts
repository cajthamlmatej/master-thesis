import {boundingBoxOfElements} from "@/utils/Area";
import type {EditorSelector} from "@/editor/selector/EditorSelector";
import {EditorBlock} from "@/editor/block/EditorBlock";
import type Editor from "@/editor/Editor";
import {BlockEvent} from "@/editor/block/events/BlockEvent";
import type {SelectorCommand} from "@/editor/selector/area/SelectorCommand";
import {RotatingSelectorCommand} from "@/editor/selector/area/command/RotatingSelectorCommand";
import {ResizingSelectorCommand} from "@/editor/selector/area/command/ResizingSelectorCommand";
import {MovingSelectorCommand} from "@/editor/selector/area/command/MovingSelectorCommand";
import {EditorMode} from "@/editor/EditorMode";

/**
 * Represents the selection area in the editor.
 * Handles the visualization, interaction, and manipulation of selected blocks.
 */
export default class EditorSelectorArea {
    private readonly selector: EditorSelector;
    private readonly editor: Editor;

    private commands: SelectorCommand[] = [];

    private element!: HTMLElement;
    private selectBoxElement!: HTMLElement;

    private x: number;
    private y: number;
    private width: number;
    private height: number;
    private rotation: number;
    private baseRotation: number;
    private baseX: number;
    private baseY: number;

    /**
     * Constructs an instance of EditorSelectorArea.
     * @param selector The editor selector instance.
     */
    constructor(selector: EditorSelector) {
        this.selector = selector;
        this.editor = selector.getEditor();

        this.commands.push(new RotatingSelectorCommand());
        this.commands.push(new MovingSelectorCommand());
        this.commands.push(new ResizingSelectorCommand());

        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.rotation = 0;
        this.baseRotation = 0;
        this.baseX = 0;
        this.baseY = 0;

        this.setupSelector();

        this.selector.events.SELECTED_BLOCK_CHANGED.on(() => {
            this.recalculateSelectionArea();
            this.handleVisibility();
        });
        this.editor.events.BLOCK_LOCK_CHANGED.on(({blocks, locked}) => {
            this.handleSelector();
        });
        this.editor.events.BLOCK_GROUP_CHANGED.on((blocks) => {
            this.handleSelector();
        });
        this.editor.events.BLOCK_CONTENT_CHANGED.on((block) => {
            this.handleSelector();
        });
        this.editor.events.BLOCK_POSITION_CHANGED.on((blockData) => {
            if (blockData.manual) {
                this.recalculateSelectionArea();
                this.handleVisibility();
            }
        });
        this.editor.events.BLOCK_ROTATION_CHANGED.on((blockData) => {
            if (blockData.manual) {
                this.recalculateSelectionArea();
                this.handleVisibility();
            }
        });
        this.editor.events.BLOCK_SIZE_CHANGED.on((blockData) => {
            if (blockData.manual) {
                this.recalculateSelectionArea();
                this.handleVisibility();
            }
        });
    }

    /**
     * Returns the current selection area dimensions and rotation.
     * @returns An object containing x, y, width, height, and rotation of the selection area.
     */
    public getArea() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            rotation: this.rotation
        };
    }

    /**
     * Updates the selector's visibility and applies appropriate styles based on the selected blocks.
     */
    public handleSelector() {
        this.element.classList.remove("editor-selector--proportional-resizing");
        this.element.classList.remove("editor-selector--non-proportional-resizing-x");
        this.element.classList.remove("editor-selector--non-proportional-resizing-y");
        this.element.classList.remove("editor-selector--move");
        this.element.classList.remove("editor-selector--rotation");
        this.element.classList.remove("editor-selector--solo");

        if (this.selector.getSelectedBlocks().length > 1) {
            this.element.style.left = this.x + "px";
            this.element.style.top = this.y + "px";
            this.element.style.width = this.width + "px";
            this.element.style.height = this.height + "px";

            this.element.style.transform = `rotate(${this.rotation}deg)`;

            if (this.selector.getSelectedBlocks().every(b => b.editorSupport().movement) && this.selector.getSelectedBlocks().every(b => b.canCurrentlyDo("move"))) {
                this.element.classList.add("editor-selector--move");
            }
            if (this.selector.getSelectedBlocks().every(b => b.editorSupport().proportionalResizing) && this.selector.getSelectedBlocks().every(b => b.canCurrentlyDo("resize"))) {
                this.element.classList.add("editor-selector--proportional-resizing");
            }
            // note(Matej): theoretically it is working, but it is not very intuitive so I am disabling it
            // if(this.selectedBlocks.every(b => b.editorSupport().nonProportionalResizingX)) {
            //     this.element.classList.add("editor-selector--non-proportional-resizing-x");
            // }
            // if(this.selectedBlocks.every(b => b.editorSupport().nonProportionalResizingY)) {
            //     this.element.classList.add("editor-selector--non-proportional-resizing-y");
            // }
            if (this.selector.getSelectedBlocks().every(b => b.editorSupport().rotation) && this.selector.getSelectedBlocks().every(b => b.canCurrentlyDo("rotate"))) {
                this.element.classList.add("editor-selector--rotation");
            }
        } else {
            const block = this.selector.getSelectedBlocks()[0];

            if (!block) return;

            this.element.style.left = block.position.x + "px";
            this.element.style.top = block.position.y + "px";
            this.element.style.width = block.size.width + "px";
            this.element.style.height = block.size.height + "px";

            this.element.style.transform = `rotate(${this.rotation}deg)`;

            const editorSupport = block.editorSupport();

            if (editorSupport.movement && block.canCurrentlyDo("move")) {
                this.element.classList.add("editor-selector--move");
            }
            if (editorSupport.proportionalResizing && block.canCurrentlyDo("resize")) {
                this.element.classList.add("editor-selector--proportional-resizing");
            }
            if (editorSupport.nonProportionalResizingX && block.canCurrentlyDo("resize")) {
                this.element.classList.add("editor-selector--non-proportional-resizing-x");
            }
            if (editorSupport.nonProportionalResizingY && block.canCurrentlyDo("resize")) {
                this.element.classList.add("editor-selector--non-proportional-resizing-y");
            }
            if (editorSupport.rotation && block.canCurrentlyDo("rotate")) {
                this.element.classList.add("editor-selector--rotation");
            }
            this.element.classList.add("editor-selector--solo");
        }
    }

    /**
     * Returns the editor instance associated with this selector area.
     * @returns The editor instance.
     */
    public getEditor() {
        return this.editor;
    }

    /**
     * Recalculates the selection area based on the currently selected blocks.
     * Emits an AREA_CHANGED event with the updated dimensions and rotation.
     */
    public recalculateSelectionArea() {
        this.element.style.transform = "rotate(0deg)";

        if (this.selector.getSelectedBlocks().length == 1) {
            const element = this.selector.getSelectedBlocks()[0];
            this.x = element.position.x;
            this.y = element.position.y;
            this.width = element.size.width;
            this.height = element.size.height;

            this.rotation = element.rotation;
        } else {
            const data = boundingBoxOfElements(this.selector.getSelectedBlocks().map(b => b.element), this.editor);

            this.x = data.x;
            this.y = data.y;
            this.width = data.width;
            this.height = data.height;
            this.rotation = 0;
            this.baseRotation = 0;
            this.baseX = 0;
            this.baseY = 0;
        }

        this.baseRotation = this.rotation;
        this.baseX = this.x;
        this.baseY = this.y;

        this.handleSelector();
        this.selector.events.AREA_CHANGED.emit({
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            rotation: this.rotation
        });
    }

    /**
     * Updates the base position and rotation of the selection area for future transformations.
     */
    public updateSelectionArea() {
        this.baseX = this.x;
        this.baseY = this.y;
        this.baseRotation = this.rotation;
    }

    /**
     * Moves the selection area by the specified delta values.
     * @param deltaX The change in the x-coordinate.
     * @param deltaY The change in the y-coordinate.
     */
    public moveSelectionArea(deltaX: number, deltaY: number) {
        this.x = this.baseX + deltaX;
        this.y = this.baseY + deltaY;
        // this.editor.debugPoint(this.x, this.y, "blue");
        // this.editor.debugPoint(this.x + this.width, this.y + this.height, "blue");
        // this.editor.debugPoint(this.x + this.width, this.y, "blue");
        // this.editor.debugPoint(this.x, this.y + this.height, "blue");

        this.selector.events.AREA_CHANGED.emit({
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            rotation: this.rotation
        });
    }

    /**
     * Rotates the selection area by the specified delta rotation.
     * @param deltaRotation The change in rotation (in degrees).
     */
    public rotateSelectionArea(deltaRotation: number) {
        this.rotation = this.baseRotation + deltaRotation;

        this.selector.events.AREA_CHANGED.emit({
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            rotation: this.rotation
        });
    }

    /**
     * Initializes the selector element and its associated events.
     */
    private setupSelector() {
        const selectorElement = document.createElement("div");
        selectorElement.classList.add("editor-selector");

        selectorElement.innerHTML = `<div class="actions"></div>`;

        for (let command of this.commands) {
            let elements = command.getElements();

            for (let element of elements instanceof Array ? elements : [elements]) {
                selectorElement.appendChild(element);

                const handler = (event: MouseEvent | TouchEvent) => {
                    event.preventDefault();
                    event.stopPropagation();

                    command.execute(event, element, this);
                };

                element.addEventListener("mousedown", handler);
                element.addEventListener("touchstart", handler, {capture: true});
            }
        }

        const selectorBoxElement = document.createElement("div");
        selectorBoxElement.classList.add("editor-select-box");

        this.editor.getEditorElement().appendChild(selectorElement);
        this.editor.getEditorElement().appendChild(selectorBoxElement);

        this.element = selectorElement;
        this.selectBoxElement = selectorBoxElement;

        this.setupEvents();
    }

    /**
     * Sets up global mouse and touch event listeners for block selection and movement.
     */
    private setupEvents() {
        const mouseDown = this.handleMouseDownEvent.bind(this);
        const touchStart = this.handleMouseDownMobileEvent.bind(this);

        // Selecting blocks
        window.addEventListener("mousedown", mouseDown)
        window.addEventListener("touchstart", touchStart, {capture: true});

        this.editor.events.EDITOR_DESTROYED.on(() => {
            window.removeEventListener("mousedown", mouseDown);
            window.removeEventListener("touchstart", touchStart);
        });
    }

    /**
     * Handles mouse down events for block selection or deselection.
     * @param event The mouse event.
     */
    private handleMouseDownEvent(event: MouseEvent) {
        // If the element is not in the editor, do not do anything
        if (!this.editor.getWrapperElement().contains(event.target as Node)) {
            return;
        }

        const blockElement = (event.target as HTMLElement).closest(".block");

        // Is a block?
        if (blockElement) {
            const block = this.editor.getBlockById(blockElement.getAttribute("data-block-id")!);

            if (!block) {
                console.error("[EditorSelector] Clicked block not found (by id).");
                return;
            }

            if (event.button !== 0) {
                // If user clicked with any other button than main, select if not selected, because the other action may need the block to be selected
                if (!this.selector.isSelected(block)) {
                    this.selector.selectBlock(block, event.shiftKey, event);
                    this.handleVisibility();
                }
                return;
            }

            this.setupMovementOrSelect(event, block);
            return;
        }

        // Probably clicked inside the editor and not in a block, deselect all blocks
        this.selector.deselectAllBlocks();
        this.handleVisibility();
        this.setupSelectBox(event);
    }

    /**
     * Handles touch start events for block selection or deselection on mobile devices.
     * @param event The touch event.
     */
    private handleMouseDownMobileEvent(event: TouchEvent) {
        // If the element is not in the editor, do not do anything
        if (!this.editor.getWrapperElement().contains(event.target as Node)) {
            return;
        }

        const blockElement = (event.target as HTMLElement).closest(".block");

        // Is a block?
        if (blockElement) {
            const block = this.editor.getBlockById(blockElement.getAttribute("data-block-id")!);

            if (!block) {
                console.error("[EditorSelector] Clicked block not found (by id).");
                return;
            }

            this.setupMovementOrSelect(event, block);
            return;
        }
    }

    /**
     * Updates the visibility of the selector based on the number of selected blocks.
     */
    private handleVisibility() {
        if (this.selector.getSelectedBlocks().length === 0) {
            this.element.classList.remove("editor-selector--active");
        } else {
            this.element.classList.add("editor-selector--active");

            this.handleSelector();
        }
    }

    /**
     * Sets up movement or selection behavior for a block based on the event.
     * @param originalEvent The original mouse or touch event.
     * @param block The block being interacted with.
     */
    private setupMovementOrSelect(originalEvent: MouseEvent | TouchEvent, block: EditorBlock) {
        this.selector.selectBlock(block, originalEvent.shiftKey, originalEvent instanceof MouseEvent ? originalEvent : undefined);
        this.handleVisibility();

        if (originalEvent.shiftKey) {
            // If shift is pressed, do not move the block
            return;
        }

        if (originalEvent instanceof MouseEvent) {
            this.setupMovementOrSelectDesktop(block, originalEvent);
        } else {
            this.setupMovementOrSelectMobile(block, originalEvent);
        }
    }

    /**
     * Retrieves the editor coordinates from a mouse or touch event.
     * @param selectorArea The selector area instance.
     * @param event The mouse or touch event.
     * @returns The x and y coordinates in editor space.
     */
    private getPositionFromEvent(selectorArea: EditorSelectorArea, event: MouseEvent | TouchEvent) {
        let x = 0, y = 0;

        if (event instanceof MouseEvent) {
            x = event.clientX;
            y = event.clientY;
        } else if (event instanceof TouchEvent) {
            x = event.touches[0].clientX;
            y = event.touches[0].clientY;
        } else {
            throw new Error("Unsupported event type");
        }

        return selectorArea.getEditor().screenToEditorCoordinates(x, y);
    }

    /**
     * Handles block movement or selection for mobile devices.
     * @param block The block being interacted with.
     * @param originalEvent The original touch event.
     */
    private setupMovementOrSelectMobile(block: EditorBlock, originalEvent: TouchEvent) {
        let {x: initialX, y: initialY} = this.getPositionFromEvent(this, originalEvent);

        let moved = false;
        const touchMoveHandler = (event: TouchEvent) => {
            if (moved) return;

            if (event.touches.length > 1)
                return;

            let {
                x: deltaX,
                y: deltaY
            } = this.editor.screenToEditorCoordinates(event.touches[0].clientX, event.touches[0].clientY);

            deltaX -= initialX;
            deltaY -= initialY;

            if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
                moved = true;
            }

            if (moved && block.locked) {
                this.selector.deselectBlock(block);

                window.removeEventListener("touchmove", touchMoveHandler);
                window.removeEventListener("touchend", touchEndHandler);
                window.removeEventListener("touchcancel", touchEndHandler);
                return;
            }

            if (moved && block.canCurrentlyDo("move")) {
                this.commands.find(c => c instanceof MovingSelectorCommand)!.execute(originalEvent, block.element, this);

                window.removeEventListener("touchmove", touchMoveHandler);
                window.removeEventListener("touchend", touchEndHandler);
                window.removeEventListener("touchcancel", touchEndHandler);
            }
        };

        const touchEndHandler = () => {
            window.removeEventListener("touchmove", touchMoveHandler);
            window.removeEventListener("touchend", touchEndHandler);
            window.removeEventListener("touchcancel", touchEndHandler);

            this.handleVisibility();
        };

        window.addEventListener("touchmove", touchMoveHandler);
        window.addEventListener("touchend", touchEndHandler);
        window.addEventListener("touchcancel", touchEndHandler);
    }

    /**
     * Handles block movement or selection for desktop devices.
     * @param block The block being interacted with.
     * @param originalEvent The original mouse event.
     */
    private setupMovementOrSelectDesktop(block: EditorBlock, originalEvent: MouseEvent) {
        let {
            x: initialX,
            y: initialY
        } = this.editor.screenToEditorCoordinates(originalEvent.clientX, originalEvent.clientY);

        let moved = false;
        const mouseMoveHandler = (event: MouseEvent) => {
            if (moved) return;

            let {x: deltaX, y: deltaY} = this.editor.screenToEditorCoordinates(event.clientX, event.clientY);

            deltaX -= initialX;
            deltaY -= initialY;

            if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
                moved = true;
            }

            if (moved && block.locked) {
                this.setupSelectBox(event);
                this.selector.deselectBlock(block);

                window.removeEventListener("mousemove", mouseMoveHandler);
                window.removeEventListener("mouseup", mouseUpHandler);
                return;
            }

            if (moved && block.canCurrentlyDo("move")) {
                this.commands.find(c => c instanceof MovingSelectorCommand)!.execute(originalEvent, block.element, this);

                window.removeEventListener("mousemove", mouseMoveHandler);
                window.removeEventListener("mouseup", mouseUpHandler);
            }
        };

        const mouseUpHandler = () => {
            window.removeEventListener("mousemove", mouseMoveHandler);
            window.removeEventListener("mouseup", mouseUpHandler);

            //this.selectBlock(block, event.shiftKey, event);
            this.handleVisibility();
        };

        window.addEventListener("mousemove", mouseMoveHandler);
        window.addEventListener("mouseup", mouseUpHandler);
    }

    /**
     * Sets up a selection box for selecting multiple blocks.
     * @param event The mouse event that initiated the selection box.
     */
    private setupSelectBox(event: MouseEvent) {
        if (this.editor.getMode() != EditorMode.SELECT) {
            return;
        }

        let {x: initialX, y: initialY} = this.editor.screenToEditorCoordinates(event.clientX, event.clientY);

        let box = {
            x: initialX,
            y: initialY,
            width: 0,
            height: 0
        };

        const updateBox = () => {
            this.selectBoxElement.classList.add("editor-select-box--active");
            this.selectBoxElement.style.left = box.x + "px";
            this.selectBoxElement.style.top = box.y + "px";
            this.selectBoxElement.style.width = Math.abs(box.width) + "px";
            this.selectBoxElement.style.height = Math.abs(box.height) + "px";
        };

        const mouseMoveHandler = (event: MouseEvent) => {
            let {x: currentX, y: currentY} = this.editor.screenToEditorCoordinates(event.clientX, event.clientY);

            box.width = currentX - initialX;
            box.height = currentY - initialY;
            box.x = initialX + (box.width < 0 ? box.width : 0);
            box.y = initialY + (box.height < 0 ? box.height : 0);

            updateBox();

            let range = {
                topLeft: {x: box.x, y: box.y},
                bottomRight: {x: box.x + Math.abs(box.width), y: box.y + Math.abs(box.height)}
            };

            for (let block of this.editor.getBlocks()) {
                if (block.overlaps(range) && !block.locked) {
                    if (!block.hovering) {
                        block.processEvent(BlockEvent.HOVER_STARTED);
                    }
                } else {
                    if (block.hovering) {
                        block.processEvent(BlockEvent.HOVER_ENDED);
                    }
                }
            }
        };

        const mouseUpHandler = () => {
            window.removeEventListener("mousemove", mouseMoveHandler);
            window.removeEventListener("mouseup", mouseUpHandler);

            let range = {
                topLeft: {x: box.x, y: box.y},
                bottomRight: {x: box.x + Math.abs(box.width), y: box.y + Math.abs(box.height)}
            };

            // Find all blocks that overlap with the box
            const foundBlocks = [];

            for (let block of this.editor.getBlocks()) {
                if (block.overlaps(range) && !block.locked) {
                    foundBlocks.push(block);
                }
            }

            // Select all found blocks
            for (let block of foundBlocks) {
                this.selector.selectBlock(block, true);
                if (block.hovering) {
                    block.processEvent(BlockEvent.HOVER_ENDED);
                }
            }
            this.selectBoxElement.classList.remove("editor-select-box--active");
        };

        window.addEventListener("mousemove", mouseMoveHandler);
        window.addEventListener("mouseup", mouseUpHandler);
    }
}
