import {SelectorCommand} from "@/editor/selector/area/SelectorCommand";
import type EditorSelectorArea from "@/editor/selector/area/EditorSelectorArea";
import {BlockEvent} from "@/editor/block/events/BlockEvent";
import {createElementFromHTML} from "@/utils/CreateElementFromHTML";

interface BlockInitialData {
    block: any;
    originalPosition: { x: number; y: number };
    originalSize: { width: number; height: number };
    originalRotation: number;
    aspectRatio: number;
    rotatedX: number;
    rotatedY: number;
}

/**
 * Command for resizing the selection area and its associated blocks.
 */
export class ResizingSelectorCommand extends SelectorCommand {

    /**
     * Returns the HTML elements used for resizing handles.
     * @returns {HTMLElement[]} The resizing handle elements.
     */
    public getElements(): HTMLElement[] {
        return [
            createElementFromHTML(`<div class="resize resize--top-left"></div>`),
            createElementFromHTML(`<div class="resize resize--top-right"></div>`),
            createElementFromHTML(`<div class="resize resize--bottom-left"></div>`),
            createElementFromHTML(`<div class="resize resize--bottom-right"></div>`),
            createElementFromHTML(`<div class="resize resize--middle-left"></div>`),
            createElementFromHTML(`<div class="resize resize--middle-right"></div>`),
            createElementFromHTML(`<div class="resize resize--top-middle"></div>`),
            createElementFromHTML(`<div class="resize resize--bottom-middle"></div>`),
        ];
    }

    /**
     * Executes the resizing command when triggered by user interaction.
     * @param event The mouse or touch event that triggered the command.
     * @param element The HTML element associated with the resizing handle.
     * @param selectorArea The selector area instance.
     */
    public execute(
        event: MouseEvent | TouchEvent,
        element: HTMLElement,
        selectorArea: EditorSelectorArea
    ): void {
        const preferences = selectorArea.getEditor().getPreferences();
        const perObject = preferences.PER_OBJECT_TRANSFORMATION;
        const {x: initialMouseX, y: initialMouseY} = this.getPositionFromEvent(selectorArea, event);
        const type =
            [...element.classList].find((c) => c.startsWith("resize--"))?.replace("resize--", "") ||
            "top-left";
        const handleTypes: {
            [key: string]: { anchorX: "left" | "center" | "right"; anchorY: "top" | "center" | "bottom" };
        } = {
            "top-left": {anchorX: "right", anchorY: "bottom"},
            "top-right": {anchorX: "left", anchorY: "bottom"},
            "bottom-left": {anchorX: "right", anchorY: "top"},
            "bottom-right": {anchorX: "left", anchorY: "top"},
            "middle-left": {anchorX: "right", anchorY: "center"},
            "middle-right": {anchorX: "left", anchorY: "center"},
            "top-middle": {anchorX: "center", anchorY: "bottom"},
            "bottom-middle": {anchorX: "center", anchorY: "top"},
        };
        const {anchorX, anchorY} = handleTypes[type] || {anchorX: "right", anchorY: "bottom"};
        const isProportional = !type.includes("middle");
        const isProportionalX = type.includes("middle-left") || type.includes("middle-right");
        const isProportionalY = type.includes("top-middle") || type.includes("bottom-middle");

        if (perObject || selectorArea.getEditor().getSelector().getSelectedBlocks().length === 1) {
            const blockInitialData = selectorArea.getEditor().getSelector().getSelectedBlocks().map(block => {
                block.processEvent(BlockEvent.RESIZING_STARTED);

                const c0_x = block.position.x + block.size.width / 2.0;
                const c0_y = block.position.y + block.size.height / 2.0;

                const a: 0 | 1 = anchorX == "right" ? 1 : 0;
                const b: 0 | 1 = anchorY == "top" ? 1 : 0;
                const c: 0 | 1 = a === 1 ? 0 : 1;
                const d: 0 | 1 = b === 1 ? 0 : 1;

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


            const mouseMoveHandler = (event: MouseEvent | TouchEvent) => {
                event.stopPropagation();
                let {
                    x: deltaX,
                    y: deltaY
                } = this.getPositionFromEvent(selectorArea, event);

                deltaX -= initialMouseX;
                deltaY -= initialMouseY;

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

                    const a: 0 | 1 = anchorX == "right" ? 1 : 0;
                    const b: 0 | 1 = anchorY == "top" ? 1 : 0;
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

                    if (!isProportional) {
                        if (isProportionalX) {
                            wtmp = Math.max(wtmp, 10);
                            htmp = block.size.height;
                        } else if (isProportionalY) {
                            htmp = Math.max(htmp, 10);
                            wtmp = block.size.width;
                        }
                    } else {
                        wtmp = Math.max(wtmp, 10);
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
                    if (content) {
                        if (isProportional) {
                            content.style.transform = `scale(${wtmp / width})`;
                        } else {
                            block.matchRenderedHeight();
                        }
                    }

                    block.element.blur();
                }

                selectorArea.recalculateSelectionArea();
            };

            const mouseUpHandler = () => {
                event.stopPropagation();
                window.removeEventListener("mousemove", mouseMoveHandler);
                window.removeEventListener("mouseup", mouseUpHandler);
                window.removeEventListener("touchmove", mouseMoveHandler, {capture: true});
                window.removeEventListener("touchend", mouseUpHandler);
                window.removeEventListener("touchcancel", mouseUpHandler);

                for (const {block, width, height} of blockInitialData) {
                    block.processEvent(BlockEvent.RESIZING_ENDED,
                        isProportional ? "PROPORTIONAL" : "NON_PROPORTIONAL",
                        {width: width, height: height});
                }
                selectorArea.recalculateSelectionArea();
            };

            window.addEventListener("mousemove", mouseMoveHandler);
            window.addEventListener("mouseup", mouseUpHandler);
            window.addEventListener("touchmove", mouseMoveHandler, {capture: true});
            window.addEventListener("touchend", mouseUpHandler);
            window.addEventListener("touchcancel", mouseUpHandler);
        } else {
            this.handleCollectiveTransformation(
                type,
                anchorX,
                anchorY,
                isProportional,
                isProportionalX,
                isProportionalY,
                initialMouseX,
                initialMouseY,
                selectorArea
            );
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
     * Handles collective resizing of multiple blocks.
     * @param type The type of resizing handle.
     * @param anchorX The horizontal anchor point.
     * @param anchorY The vertical anchor point.
     * @param isProportional Whether resizing should maintain aspect ratio.
     * @param isProportionalX Whether resizing is proportional along the x-axis.
     * @param isProportionalY Whether resizing is proportional along the y-axis.
     * @param initialMouseX The initial x-coordinate of the mouse.
     * @param initialMouseY The initial y-coordinate of the mouse.
     * @param selectorArea The selector area instance.
     */
    private handleCollectiveTransformation(
        type: string,
        anchorX: "left" | "center" | "right",
        anchorY: "top" | "center" | "bottom",
        isProportional: boolean,
        isProportionalX: boolean,
        isProportionalY: boolean,
        initialMouseX: number,
        initialMouseY: number,
        selectorArea: EditorSelectorArea
    ): void {
        const selectedBlocks = selectorArea.getEditor().getSelector().getSelectedBlocks();
        if (selectedBlocks.length === 0) return;

        let minX = Infinity,
            minY = Infinity,
            maxX = -Infinity,
            maxY = -Infinity;
        selectedBlocks.forEach((block) => {
            minX = Math.min(minX, block.position.x);
            minY = Math.min(minY, block.position.y);
            maxX = Math.max(maxX, block.position.x + block.size.width);
            maxY = Math.max(maxY, block.position.y + block.size.height);
        });

        let anchorPoint: { x: number; y: number } = {x: 0, y: 0};
        switch (anchorX) {
            case "left":
                anchorPoint.x = minX;
                break;
            case "center":
                anchorPoint.x = (minX + maxX) / 2;
                break;
            case "right":
                anchorPoint.x = maxX;
                break;
        }
        switch (anchorY) {
            case "top":
                anchorPoint.y = minY;
                break;
            case "center":
                anchorPoint.y = (minY + maxY) / 2;
                break;
            case "bottom":
                anchorPoint.y = maxY;
                break;
        }

        // note(Matej): in future maybe we will need to calculate this value based on the blocks' rotation
        //              currently the selection area after rotation is snapped to 0 degrees
        const selectionRotation = 0;
        const theta = (selectionRotation * Math.PI) / 180;
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);

        const blocksInitialData: BlockInitialData[] = selectedBlocks.map((block) => {
            block.processEvent(BlockEvent.RESIZING_STARTED);
            const dx = block.position.x - anchorPoint.x;
            const dy = block.position.y - anchorPoint.y;
            const rotatedX = dx * cosTheta + dy * sinTheta;
            const rotatedY = -dx * sinTheta + dy * cosTheta;
            return {
                block,
                originalPosition: {x: block.position.x, y: block.position.y},
                originalSize: {width: block.size.width, height: block.size.height},
                originalRotation: block.rotation,
                aspectRatio: block.size.width / block.size.height,
                rotatedX,
                rotatedY,
            };
        });
        const mouseMoveHandler = (moveEvent: MouseEvent | TouchEvent) => {
            const {x: currentMouseX, y: currentMouseY} = this.getPositionFromEvent(selectorArea, moveEvent);

            const deltaX = currentMouseX - initialMouseX;
            const deltaY = currentMouseY - initialMouseY;

            const localDeltaX = deltaX * cosTheta + deltaY * sinTheta;
            const localDeltaY = -deltaX * sinTheta + deltaY * cosTheta;

            let scaleX = 1,
                scaleY = 1;
            switch (type) {
                case "top-left":
                case "middle-left":
                case "bottom-left":
                    scaleX = (1 - localDeltaX / (maxX - minX));
                    break;
                case "top-right":
                case "middle-right":
                case "bottom-right":
                    scaleX = (1 + localDeltaX / (maxX - minX));
                    break;
            }

            switch (type) {
                case "top-left":
                case "top-middle":
                case "top-right":
                    scaleY = (1 - localDeltaY / (maxY - minY));
                    break;
                case "bottom-left":
                case "bottom-middle":
                case "bottom-right":
                    scaleY = (1 + localDeltaY / (maxY - minY));
                    break;
            }

            if (isProportional) {
                const scale = Math.min(scaleX, scaleY);
                scaleX = scaleY = scale;
            } else {
                if (isProportionalX) {
                    scaleY = 1;
                }
                if (isProportionalY) {
                    scaleX = 1;
                }
            }

            scaleX = Math.max(scaleX, 0.1);
            scaleY = Math.max(scaleY, 0.1);

            blocksInitialData.forEach((data) => {
                const {block, rotatedX, rotatedY, originalSize, aspectRatio} = data;
                const newRotatedX = rotatedX * scaleX;
                const newRotatedY = rotatedY * scaleY;
                const newX = newRotatedX * cosTheta - newRotatedY * sinTheta;
                const newY = newRotatedX * sinTheta + newRotatedY * cosTheta;
                const absoluteX = anchorPoint.x + newX;
                const absoluteY = anchorPoint.y + newY;
                let newWidth = originalSize.width * scaleX;
                let newHeight = originalSize.height * scaleY;

                if (isProportional) {
                    newHeight = newWidth / aspectRatio;
                } else {
                    if (isProportionalX) {
                        newHeight = originalSize.height;
                    }
                    if (isProportionalY) {
                        newWidth = originalSize.width;
                    }
                }

                newWidth = Math.max(newWidth, 10);
                newHeight = Math.max(newHeight, 10);

                block.move(absoluteX, absoluteY, true);
                block.resize(newWidth, newHeight, true);
                block.synchronize();

                const content = block.getContent();
                if (content) {
                    if (isProportional) {
                        const scaleFactor = newWidth / originalSize.width;
                        content.style.transform = `scale(${scaleFactor})`;
                    } else {
                        content.style.transform = `scale(1)`;
                        block.matchRenderedHeight();
                    }
                }

                block.element.blur();
            });

            selectorArea.recalculateSelectionArea();
        };

        const mouseUpHandler = () => {
            window.removeEventListener("mousemove", mouseMoveHandler);
            window.removeEventListener("mouseup", mouseUpHandler);
            window.removeEventListener("touchmove", mouseMoveHandler, {capture: true});
            window.removeEventListener("touchend", mouseUpHandler);
            window.removeEventListener("touchcancel", mouseUpHandler);

            blocksInitialData.forEach((data) => {
                data.block.processEvent(BlockEvent.RESIZING_ENDED, isProportional ? "PROPORTIONAL" : "NON_PROPORTIONAL", {
                    width: data.block.size.width,
                    height: data.block.size.height,
                });
            });
            selectorArea.recalculateSelectionArea();
        };

        window.addEventListener("mousemove", mouseMoveHandler);
        window.addEventListener("mouseup", mouseUpHandler);
        window.addEventListener("touchmove", mouseMoveHandler, {capture: true});
        window.addEventListener("touchend", mouseUpHandler);
        window.addEventListener("touchcancel", mouseUpHandler);
    }
}
