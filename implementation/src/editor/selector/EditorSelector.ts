import type {Block} from "@/editor/block/Block";
import type Editor from "@/editor/Editor";

export class EditorSelector {
    private editor: Editor;
    private selectedBlocks: Block[] = [];
    private element!: HTMLElement;

    constructor(editor: Editor) {
        this.editor = editor;

        this.setupSelector();
    }

    private setupSelector() {
        this.editor.getElement().innerHTML += `<div class="editor-selector">
    <div class="move move--top"></div>
    <div class="move move--right"></div>
    <div class="move move--bottom"></div>
    <div class="move move--left"></div>

    <div class="resize resize--top-left"></div>
    <div class="resize resize--top-right"></div>
    <div class="resize resize--bottom-right"></div>
    <div class="resize resize--bottom-left"></div>
    <div class="resize resize--middle-right"></div>
    <div class="resize resize--middle-left"></div>

    <div class="resize resize--top-middle"></div>
    <div class="resize resize--bottom-middle"></div>

    <div class="rotate"></div>
    <div class="actions"></div>
</div>`
        this.element = this.editor.getElement().querySelector(".editor-selector")! as HTMLElement;

        this.setupEvents();
    }

    private handleVisibility() {
        if (this.selectedBlocks.length === 0) {
            this.element.classList.remove("editor-selector--active");
        } else {
            this.element.classList.add("editor-selector--active");

            this.handleSelector();
        }
    }

    private selectionArea = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        rotation: 0,
        baseRotation: 0
    };
    private boxAreaAroundElements() {
        let x = 0;
        let y = 0;
        let width = 0;
        let height = 0;

        for (const block of this.selectedBlocks) {
            const blockElement = block.element;
            const blockRect = blockElement.getBoundingClientRect();

            if (x === 0 || blockRect.left < x) {
                x = blockRect.left;
            }

            if (y === 0 || blockRect.top < y) {
                y = blockRect.top;
            }

            if (blockRect.right > width) {
                width = blockRect.right;
            }

            if (blockRect.bottom > height) {
                height = blockRect.bottom;
            }
        }

        let inEditor = this.editor.screenToEditorCoordinates(x, y);

        // Offset the x and y to the editor
        let offset = this.editor.getOffset();
        width -= offset.x;
        height -= offset.y;

        width /= this.editor.getScale();
        height /= this.editor.getScale();

        return {
            x: inEditor.x,
            y: inEditor.y,
            width: width - inEditor.x,
            height: height - inEditor.y
        }
    }

    /**
     * Checks if the selector should be visible and updates its position, size, rotation and visible actions.
     * @private
     */
    public handleSelector() {
        if(this.selectedBlocks.length > 1) {
            const sizeAndPosition = this.selectionArea;

            this.element.style.left = sizeAndPosition.x + "px";
            this.element.style.top = sizeAndPosition.y + "px";
            this.element.style.width = sizeAndPosition.width + "px";
            this.element.style.height = sizeAndPosition.height + "px";

            this.element.style.transform = `rotate(${sizeAndPosition.rotation}deg)`;

            this.element.classList.remove("editor-selector--proportional-resizing");
            this.element.classList.remove("editor-selector--non-proportional-resizing-x");
            this.element.classList.remove("editor-selector--non-proportional-resizing-y");

            if(this.selectedBlocks.every(b => b.editorSupport().proportionalResizing)) {
                this.element.classList.add("editor-selector--proportional-resizing");
            }
            // note(Matej): theoretically it is working, but it is not very intuitive so I am disabling it
            // if(this.selectedBlocks.every(b => b.editorSupport().nonProportionalResizingX)) {
            //     this.element.classList.add("editor-selector--non-proportional-resizing-x");
            // }
            // if(this.selectedBlocks.every(b => b.editorSupport().nonProportionalResizingY)) {
            //     this.element.classList.add("editor-selector--non-proportional-resizing-y");
            // }
            if(this.selectedBlocks.every(b => b.editorSupport().rotation)) {
                this.element.classList.add("editor-selector--rotation");
            }
        } else {
            const block = this.selectedBlocks[0];

            if(!block) return;

            this.element.style.left = block.position.x + "px";
            this.element.style.top = block.position.y + "px";
            this.element.style.width = block.size.width + "px";
            this.element.style.height = block.size.height + "px";

            this.element.style.transform = `rotate(${this.selectionArea.rotation}deg)`;

            this.element.classList.remove("editor-selector--proportional-resizing");
            this.element.classList.remove("editor-selector--non-proportional-resizing-x");
            this.element.classList.remove("editor-selector--non-proportional-resizing-y");

            const editorSupport = block.editorSupport();

            if(editorSupport.proportionalResizing) {
                this.element.classList.add("editor-selector--proportional-resizing");
            }
            if(editorSupport.nonProportionalResizingX) {
                this.element.classList.add("editor-selector--non-proportional-resizing-x");
            }
            if(editorSupport.nonProportionalResizingY) {
                this.element.classList.add("editor-selector--non-proportional-resizing-y");
            }
            if(editorSupport.rotation) {
                this.element.classList.add("editor-selector--rotation");
            }
        }
    }

    private deselectAllBlocks() {
        for (const block of this.selectedBlocks) {
            this.deselectBlock(block);
        }

        this.selectedBlocks = [];
    }

    private deselectBlock(block: Block) {
        block.onDeselected();
    }

    private selectBlock(block: Block, addToSelection: boolean = false) {
        if (!addToSelection) {
            this.deselectAllBlocks();
        }

        if (this.selectedBlocks.includes(block)) {
            this.deselectBlock(block);
            this.selectedBlocks = this.selectedBlocks.filter(b => b !== block);
            this.recalculateSelectionArea();
            return;
        }

        const editorSupport = block.editorSupport();

        if(!editorSupport.selection) {
            return;
        }

        block.onSelected();
        this.selectedBlocks.push(block);

        this.recalculateSelectionArea();
    }

    private recalculateSelectionArea() {
        this.element.style.transform = "rotate(0deg)";

        this.selectionArea = {
            ...this.boxAreaAroundElements(),
            rotation: 0,
            baseRotation: 0
        };

        if(this.selectedBlocks.length == 1) {
            this.selectionArea.rotation = this.selectedBlocks[0].rotation;
            this.selectionArea.baseRotation = this.selectedBlocks[0].rotation;
        }

        this.handleSelector();
    }

    private setupEvents() {
        // Selecting blocks
        window.addEventListener("mousedown", (event) => {
            // If the element is not in the editor, do not do anything
            if (!this.editor.getElement().contains(event.target as Node)) {
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

                this.selectBlock(block, event.shiftKey);

                this.handleVisibility();
                return;
            }

            // Probably clicked inside the editor and not in a block, deselect all blocks
            this.deselectAllBlocks();
            this.handleVisibility();
        });

        // Moving blocks
        const movementElements = this.element.querySelectorAll(".move");

        for (let moveElement of movementElements) {
            moveElement.addEventListener("mousedown", (event) => {
                if (!(event instanceof MouseEvent)) return;

                event.preventDefault();
                event.stopPropagation();

                this.setupMovement(event, moveElement as HTMLElement);
            });
        }

        // Resizing blocks
        const resizeElements = this.element.querySelectorAll(".resize");

        for (let resizeElement of resizeElements) {
            resizeElement.addEventListener("mousedown", (event) => {
                if (!(event instanceof MouseEvent)) return;

                event.preventDefault();
                event.stopPropagation();

                this.setupResizing(event, resizeElement as HTMLElement);
            });
        }

        // Rotating blocks
        const rotateElement = this.element.querySelector(".rotate")! as HTMLElement;

        rotateElement.addEventListener("mousedown", (event) => {
            event.preventDefault();
            event.stopPropagation();

            this.setupRotation(event, rotateElement);
        });
    }

    private setupMovement(event: MouseEvent, moveElement: HTMLElement) {
        let {x: initialX, y: initialY} = this.editor.screenToEditorCoordinates(event.clientX, event.clientY);

        const initialPositions = this.selectedBlocks.map(block => {
            return {
                block,
                x: block.position.x,
                y: block.position.y
            };
        });

        const mouseMoveHandler = (event: MouseEvent) => {
            let {x: deltaX, y: deltaY} = this.editor.screenToEditorCoordinates(event.clientX, event.clientY);

            for (const {block, x, y} of initialPositions) {
                block.move(x + deltaX - initialX, y + deltaY - initialY);

                block.element.blur();
            }

            this.handleSelector();
        };

        const mouseUpHandler = () => {
            window.removeEventListener("mousemove", mouseMoveHandler);
            window.removeEventListener("mouseup", mouseUpHandler);

            for (const {block, x, y} of initialPositions) {
                block.onMovementCompleted({x: x, y: y});
            }
            this.recalculateSelectionArea();
        };

        window.addEventListener("mousemove", mouseMoveHandler);
        window.addEventListener("mouseup", mouseUpHandler);
    }

    private setupResizing(event: MouseEvent, resizeElement: HTMLElement, minWidth: number = 10) {
        let {x: initialX, y: initialY} = this.editor.screenToEditorCoordinates(event.clientX, event.clientY);

        const initialSizes = this.selectedBlocks.map(block => {
            return {
                block,
                width: block.size.width,
                height: block.size.height,
                x: block.position.x,
                y: block.position.y,
                aspectRatio: block.size.width / block.size.height
            };
        });

        const mouseMoveHandler = (event: MouseEvent) => {
            let {x: deltaX, y: deltaY} = this.editor.screenToEditorCoordinates(event.clientX, event.clientY);

            for (const {block, width, height, x, y, aspectRatio} of initialSizes) {
                let newWidth = width;
                let newHeight = height;
                let newX = x;
                let newY = y;

                let scale = true;
                if (resizeElement.classList.contains("resize--top-left")) {
                    newWidth = width + (initialX - deltaX);
                    if (newWidth < minWidth) newWidth = minWidth;
                    newHeight = newWidth / aspectRatio;

                    newX = x - (newWidth - width);
                    newY = y - (newHeight - height);
                } else if (resizeElement.classList.contains("resize--top-right")) {
                    newWidth = width - (initialX - deltaX);
                    if (newWidth < minWidth) newWidth = minWidth;
                    newHeight = newWidth / aspectRatio;
                    newY = y - (newHeight - height);
                } else if (resizeElement.classList.contains("resize--bottom-right")) {
                    newWidth = width - (initialX - deltaX);
                    if (newWidth < minWidth) newWidth = minWidth;
                    newHeight = newWidth / aspectRatio;
                } else if (resizeElement.classList.contains("resize--bottom-left")) {
                    newWidth = width + (initialX - deltaX);
                    if (newWidth < minWidth) newWidth = minWidth;
                    newHeight = newWidth / aspectRatio;
                    newX = x - (newWidth - width);
                } else if (resizeElement.classList.contains("resize--middle-right")) {
                    newWidth = width - (initialX - deltaX);
                    if (newWidth < minWidth) newWidth = minWidth;
                    scale = false;
                } else if (resizeElement.classList.contains("resize--middle-left")) {
                    newWidth = width + (initialX - deltaX);
                    if (newWidth < minWidth) newWidth = minWidth;
                    newX = x - (newWidth - width);
                    scale = false;
                } else if (resizeElement.classList.contains("resize--top-middle")) {
                    newHeight = height + (initialY - deltaY);
                    if (newHeight < minWidth) newHeight = minWidth;
                    newY = y - (newHeight - height);
                    scale = false;
                } else if (resizeElement.classList.contains("resize--bottom-middle")) {
                    newHeight = height - (initialY - deltaY);
                    if (newHeight < minWidth) newHeight = minWidth;
                    scale = false;
                }

                block.move(newX, newY);
                block.size = {
                    width: newWidth,
                    height: newHeight
                };

                const content = block.getContent();
                if(content) {
                    if (scale) {
                        content.style.transform = `scale(${newWidth / width})`;
                    } else {
                        block.matchRenderedHeight();
                    }
                }

                block.element.blur();
            }

            this.recalculateSelectionArea();
        };

        const mouseUpHandler = () => {
            window.removeEventListener("mousemove", mouseMoveHandler);
            window.removeEventListener("mouseup", mouseUpHandler);

            const type = [...resizeElement.classList].find(c => c.startsWith('resize--'))?.replace('resize--', '') ?? 'top-left';

            for (const {block, width, height} of initialSizes) {
                block.onResizeCompleted(
                    ['bottom-right', 'top-left', 'top-right', 'bottom-left'].includes(type) ? "PROPORTIONAL" : "NON_PROPORTIONAL",
                    {width: width, height: height});
            }
            this.recalculateSelectionArea();
        };

        window.addEventListener("mousemove", mouseMoveHandler);
        window.addEventListener("mouseup", mouseUpHandler);
    }

    private setupRotation(event: MouseEvent, rotateElement: HTMLElement) {
        let { x: initialX, y: initialY } = this.editor.screenToEditorCoordinates(event.clientX, event.clientY);

        const sizeAndPosition = this.selectionArea;

        const centerX = sizeAndPosition.x + (sizeAndPosition.width / 2);
        const centerY = sizeAndPosition.y + (sizeAndPosition.height / 2);

        let currentAngle = 0;
        let lastAngle = Math.atan2(initialY - centerY, initialX - centerX);
        const initialPositions = this.selectedBlocks.map(block => ({
            block,
            rotation: block.rotation,
            offsetX: block.position.x + (block.size.width / 2) - centerX,
            offsetY: block.position.y + (block.size.height / 2) - centerY
        }));

        const mouseMoveHandler = (event: MouseEvent) => {
            const { x: currentX, y: currentY } = this.editor.screenToEditorCoordinates(
                event.clientX,
                event.clientY
            );

            const angle = Math.atan2(currentY - centerY, currentX - centerX);

            let diff = angle - lastAngle;

            if (diff > Math.PI) diff -= Math.PI * 2;
            if (diff < -Math.PI) diff += Math.PI * 2;

            currentAngle += diff;

            for (const position of initialPositions) {
                const { block, rotation, offsetX, offsetY } = position;

                // Calculate the rotated position of the block around the center
                let rotatedX = centerX + offsetX * Math.cos(currentAngle) - offsetY * Math.sin(currentAngle);
                let rotatedY = centerY + offsetX * Math.sin(currentAngle) + offsetY * Math.cos(currentAngle);

                rotatedX -= block.size.width / 2;
                rotatedY -= block.size.height / 2;

                // Set the new position and rotation
                block.move(rotatedX, rotatedY);
                block.rotate(rotation + (currentAngle * 180) / Math.PI);
            }

            // Update selection area rotation
            this.selectionArea.rotation = this.selectionArea.baseRotation + (currentAngle * 180) / Math.PI;

            lastAngle = angle;

            this.handleSelector();
        };

        const mouseUpHandler = () => {
            window.removeEventListener("mousemove", mouseMoveHandler);
            window.removeEventListener("mouseup", mouseUpHandler);

            for (const { block, rotation } of initialPositions) {
                block.onRotationCompleted(rotation);
            }

            this.selectionArea.baseRotation = this.selectionArea.rotation;
            // this.recalculateSelectionArea();
        };

        window.addEventListener("mousemove", mouseMoveHandler);
        window.addEventListener("mouseup", mouseUpHandler);
    }
}
