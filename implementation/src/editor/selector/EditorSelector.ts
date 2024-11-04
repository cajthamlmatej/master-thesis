import type {Block} from "@/editor/block/Block";
import type Editor from "@/editor/Editor";

export class EditorSelector {
    private editor: Editor;
    private selectedBlocks: Block[] = [];
    private element!: HTMLElement;
    private selectBoxElement!: HTMLElement;
    private selectionArea = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        rotation: 0,
        baseRotation: 0,
        baseX: 0,
        baseY: 0
    };

    constructor(editor: Editor) {
        this.editor = editor;

        this.setupSelector();
    }

    private setupSelector() {
        const selectorElement = document.createElement("div");
        selectorElement.classList.add("editor-selector");

        selectorElement.innerHTML =
`<div class="move move--top"></div>
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
<div class="actions"></div>`

        const selectorBoxElement = document.createElement("div");

        selectorBoxElement.classList.add("editor-select-box");

        this.editor.getElement().appendChild(selectorElement);
        this.editor.getElement().appendChild(selectorBoxElement);

        this.element = selectorElement;
        this.selectBoxElement = selectorBoxElement;

        this.setupEvents();
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

                if(event.button !== 0) {
                    if(!this.isSelected(block)) {
                        this.selectBlock(block, event.shiftKey, event);
                        this.handleVisibility();
                    }
                    return;
                }

                this.setupMovementOrSelect(event, block);
                return;
            }

            // Probably clicked inside the editor and not in a block, deselect all blocks
            this.deselectAllBlocks();
            this.handleVisibility();

            this.setupSelectBox(event);
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

    private handleVisibility() {
        if (this.selectedBlocks.length === 0) {
            this.element.classList.remove("editor-selector--active");
        } else {
            this.element.classList.add("editor-selector--active");

            this.handleSelector();
        }
    }



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
            height: height - inEditor.y,
        }
    }

    private recalculateSelectionArea() {
        this.element.style.transform = "rotate(0deg)";

        this.selectionArea = {
            ...this.boxAreaAroundElements(),
            rotation: 0,
            baseRotation: 0,
            baseX: 0,
            baseY: 0
        };

        if(this.selectedBlocks.length == 1) {
            this.selectionArea.rotation = this.selectedBlocks[0].rotation;
            this.selectionArea.baseRotation = this.selectedBlocks[0].rotation;
        }

        this.selectionArea.baseX = this.selectionArea.x;
        this.selectionArea.baseY = this.selectionArea.y;

        this.handleSelector();
    }

    private moveSelectionArea(deltaX: number, deltaY: number) {
        this.selectionArea.x = this.selectionArea.baseX + deltaX;
        this.selectionArea.y = this.selectionArea.baseY + deltaY;
    }



    private deselectAllBlocks() {
        for (const block of this.selectedBlocks) {
            this.deselectBlock(block);
        }

        this.selectedBlocks = [];
    }

    public deselectBlock(block: Block) {
        this.selectedBlocks = this.selectedBlocks.filter(b => b !== block);
        this.recalculateSelectionArea();
        this.handleVisibility();
        block.onDeselected();
    }

    public selectBlock(block: Block, addToSelection: boolean = false, event?: MouseEvent) {
        if (!addToSelection) {
            if(this.selectedBlocks.length === 1 && this.selectedBlocks[0] === block && event) {
                block.onClicked(event);

                return
            }

            this.deselectAllBlocks();
        }

        if (this.selectedBlocks.includes(block)) {
            this.deselectBlock(block);
            return;
        }

        const editorSupport = block.editorSupport();

        if(!editorSupport.selection) {
            return;
        }

        block.onSelected();
        this.selectedBlocks.push(block);

        this.recalculateSelectionArea();
        this.handleVisibility();
    }

    public isSelected(block: Block, soloOnly: boolean = false) {
        if(soloOnly) {
            return this.selectedBlocks.length === 1 && this.selectedBlocks[0] === block;
        }

        return this.selectedBlocks.includes(block);
    }
    public getSelectedBlocks() {
        return this.selectedBlocks;
    }
    public clearSelection() {
        this.deselectAllBlocks();
        this.handleVisibility();
    }


    private setupMovementOrSelect(event: MouseEvent, block: Block) {
        let {x: initialX, y: initialY} = this.editor.screenToEditorCoordinates(event.clientX, event.clientY);

        this.selectBlock(block, event.shiftKey, event);
        this.handleVisibility();

        if(event.shiftKey) {
            // If shift is pressed, do not move the block
            return;
        }

        let moved = false;
        const mouseMoveHandler = (event: MouseEvent) => {
            if(moved) return;

            let {x: deltaX, y: deltaY} = this.editor.screenToEditorCoordinates(event.clientX, event.clientY);

            deltaX -= initialX;
            deltaY -= initialY;

            if(Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
                moved = true;
            }

            if(moved && block.canCurrentlyDo("move")) {
                this.setupMovement(event, block.element, {x: initialX, y: initialY});

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

    private setupMovement(event: MouseEvent, moveElement: HTMLElement, initial?: {x: number, y: number}) {
        let {x: initialX, y: initialY} = this.editor.screenToEditorCoordinates(event.clientX, event.clientY);

        if(initial) {
            initialX = initial.x;
            initialY = initial.y;
        }

        const initialPositions = this.selectedBlocks.map(block => {
            block.onMovementStarted();

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

            this.moveSelectionArea(deltaX - initialX, deltaY - initialY);
            this.handleSelector();
        };

        const mouseUpHandler = () => {
            window.removeEventListener("mousemove", mouseMoveHandler);
            window.removeEventListener("mouseup", mouseUpHandler);

            for (const {block, x, y} of initialPositions) {
                block.onMovementCompleted({x: x, y: y});
            }

            this.handleSelector();
            // this.recalculateSelectionArea();
        };

        window.addEventListener("mousemove", mouseMoveHandler);
        window.addEventListener("mouseup", mouseUpHandler);
    }

    private setupResizing(event: MouseEvent, resizeElement: HTMLElement, minWidth: number = 10) {
        let {x: initialX, y: initialY} = this.editor.screenToEditorCoordinates(event.clientX, event.clientY);

        const type = [...resizeElement.classList].find(c => c.startsWith('resize--'))?.replace('resize--', '') ?? 'top-left';

        const isLeft = type.includes('left');
        const isBottom = type.includes('bottom');
        const isNotProportional = type.includes('middle');
        const isProportional = !isNotProportional;
        const isProportionalX = type.includes('middle-left') || type.includes('middle-right');
        const isProportionalY = type.includes('top-middle') || type.includes('bottom-middle');

        const blockInitialData = this.selectedBlocks.map(block => {
            block.onResizeStarted();

            const c0_x = block.position.x + block.size.width / 2.0;
            const c0_y = block.position.y + block.size.height / 2.0;

            const a: 0 | 1 = isLeft     ? 1 : 0;
            const b: 0 | 1 = isBottom   ? 1 : 0;
            const c: 0 | 1 = a === 1    ? 0 : 1;
            const d: 0 | 1 = b === 1    ? 0 : 1;

            const matrix = {
                a: c,
                b: b,
                c: a,
                d: d,
            };

            const l = block.position.x;
            const t = block.position.y;
            const w = block.size.width;
            const h = block.size.height;

            const q0_x: number = l + matrix.a * w;
            const q0_y: number = t + matrix.b * h;

            const p0_x: number = l + matrix.c * w;
            const p0_y: number = t + matrix.d * h;

            const theta: number = (Math.PI * 2 * block.rotation) / 360;
            const cos_t: number = Math.cos(theta);
            const sin_t: number = Math.sin(theta);

            const qp0_x = q0_x * cos_t - q0_y * sin_t - c0_x * cos_t + c0_y * sin_t + c0_x;
            const qp0_y = q0_x * sin_t + q0_y * cos_t - c0_x * sin_t - c0_y * cos_t + c0_y;

            const pp_x = p0_x * cos_t - p0_y * sin_t - c0_x * cos_t + c0_y * sin_t + c0_x;
            const pp_y = p0_x * sin_t + p0_y * cos_t - c0_x * sin_t - c0_y * cos_t + c0_y;

            return {
                block,
                qp0_x,
                qp0_y,
                pp_x,
                pp_y,
                aspectRatio: block.size.width / block.size.height,
                width: block.size.width,
                height: block.size.height
            }
        });


        const mouseMoveHandler = (event: MouseEvent) => {
            let {x: deltaX, y: deltaY} = this.editor.screenToEditorCoordinates(event.clientX, event.clientY);

            deltaX -= initialX;
            deltaY -= initialY;

            for (const {block, qp0_x, qp0_y, pp_x, pp_y, aspectRatio, width} of blockInitialData) {
                const qp_x: number = qp0_x + deltaX;
                const qp_y: number = qp0_y + deltaY;

                const cp_x: number = (qp_x + pp_x) / 2.0;
                const cp_y: number = (qp_y + pp_y) / 2.0;

                const mtheta: number = (-1 * Math.PI * 2 * block.rotation) / 360;
                const cos_mt: number = Math.cos(mtheta);
                const sin_mt: number = Math.sin(mtheta);

                let q_x: number = qp_x * cos_mt - qp_y * sin_mt - cos_mt * cp_x + sin_mt * cp_y + cp_x;
                let q_y: number = qp_x * sin_mt + qp_y * cos_mt - sin_mt * cp_x - cos_mt * cp_y + cp_y;

                let p_x: number = pp_x * cos_mt - pp_y * sin_mt - cos_mt * cp_x + sin_mt * cp_y + cp_x;
                let p_y: number = pp_x * sin_mt + pp_y * cos_mt - sin_mt * cp_x - cos_mt * cp_y + cp_y;

                const a: 0 | 1 = isLeft ? 1 : 0;
                const b: 0 | 1 = isBottom ? 1 : 0;
                const c: 0 | 1 = a === 1 ? 0 : 1;
                const d: 0 | 1 = b === 1 ? 0 : 1;

                const matrix = {
                    a: c,
                    b: b,
                    c: a,
                    d: d,
                };

                let wtmp: number = matrix.a * (q_x - p_x) + matrix.c * (p_x - q_x);
                let htmp: number = matrix.b * (q_y - p_y) + matrix.d * (p_y - q_y);


                if (isNotProportional) {
                    if(isProportionalX) {
                        wtmp = Math.max(wtmp, minWidth);
                        htmp = block.size.height;
                    } else if (isProportionalY) {
                        htmp = Math.max(htmp, minWidth);
                        wtmp = block.size.width;
                    }
                } else {
                    wtmp = Math.max(wtmp, minWidth);
                    htmp = wtmp / aspectRatio;
                }


                const theta: number = -1 * mtheta;
                const cos_t: number = Math.cos(theta);
                const sin_t: number = Math.sin(theta);

                const dh_x: number = -sin_t * htmp;
                const dh_y: number = cos_t * htmp;

                const dw_x: number = cos_t * wtmp;
                const dw_y: number = sin_t * wtmp;

                const qp_x_min: number = pp_x + (matrix.a - matrix.c) * dw_x + (matrix.b - matrix.d) * dh_x;
                const qp_y_min: number = pp_y + (matrix.a - matrix.c) * dw_y + (matrix.b - matrix.d) * dh_y;

                const cp_x_min: number = (qp_x_min + pp_x) / 2.0;
                const cp_y_min: number = (qp_y_min + pp_y) / 2.0;

                q_x = qp_x_min * cos_mt - qp_y_min * sin_mt - cos_mt * cp_x_min + sin_mt * cp_y_min + cp_x_min;
                q_y = qp_x_min * sin_mt + qp_y_min * cos_mt - sin_mt * cp_x_min - cos_mt * cp_y_min + cp_y_min;

                p_x = pp_x * cos_mt - pp_y * sin_mt - cos_mt * cp_x_min + sin_mt * cp_y_min + cp_x_min;
                p_y = pp_x * sin_mt + pp_y * cos_mt - sin_mt * cp_x_min - cos_mt * cp_y_min + cp_y_min;


                const newL: number = matrix.c * q_x + matrix.a * p_x;
                const newT: number = matrix.d * q_y + matrix.b * p_y;

                block.move(newL, newT, true);
                block.resize(wtmp, htmp, true);
                block.synchronize();

                const content = block.getContent();
                if(content) {
                    if (isProportional) {
                        content.style.transform = `scale(${wtmp / width})`;
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

            for (const {block, width, height} of blockInitialData) {
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
        const initialPositions = this.selectedBlocks.map(block => {
            block.onRotationStarted();

            return {
                block,
                rotation: block.rotation,
                offsetX: block.position.x + (block.size.width / 2) - centerX,
                offsetY: block.position.y + (block.size.height / 2) - centerY
            }
        });

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

    private setupSelectBox(event: MouseEvent) {
        let { x: initialX, y: initialY } = this.editor.screenToEditorCoordinates(event.clientX, event.clientY);

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
            let { x: currentX, y: currentY } = this.editor.screenToEditorCoordinates(event.clientX, event.clientY);

            box.width = currentX - initialX;
            box.height = currentY - initialY;
            box.x = initialX + (box.width < 0 ? box.width : 0);
            box.y = initialY + (box.height < 0 ? box.height : 0);

            updateBox();

            let range = {topLeft: {x: box.x, y: box.y}, bottomRight: {x: box.x + Math.abs(box.width), y: box.y + Math.abs(box.height)}};

            for(let block of this.editor.getBlocks()) {
                if(block.overlaps(range)) {
                    if(!block.hovering) {
                        block.onHoverStarted();
                    }
                } else {
                    if(block.hovering) {
                        block.onHoverEnded();
                    }
                }
            }
        };

        const mouseUpHandler = () => {
            window.removeEventListener("mousemove", mouseMoveHandler);
            window.removeEventListener("mouseup", mouseUpHandler);

            let range = {topLeft: {x: box.x, y: box.y}, bottomRight: {x: box.x + Math.abs(box.width), y: box.y + Math.abs(box.height)}};

            // Find all blocks that overlap with the box
            const foundBlocks = [];

            for(let block of this.editor.getBlocks()) {
                if(block.overlaps(range)) {
                    foundBlocks.push(block);
                }
            }

            // Select all found blocks
            for(let block of foundBlocks) {
                this.selectBlock(block, true);
                if(block.hovering) {
                    block.onHoverEnded();
                }
            }
            this.selectBoxElement.classList.remove("editor-select-box--active");
        };

        window.addEventListener("mousemove", mouseMoveHandler);
        window.addEventListener("mouseup", mouseUpHandler);
    }
}
