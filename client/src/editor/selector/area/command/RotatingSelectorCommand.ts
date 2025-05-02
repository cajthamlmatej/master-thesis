import {SelectorCommand} from "@/editor/selector/area/SelectorCommand";
import type EditorSelectorArea from "@/editor/selector/area/EditorSelectorArea";
import {BlockEvent} from "@/editor/block/events/BlockEvent";
import {createElementFromHTML} from "@/utils/CreateElementFromHTML";

/**
 * The RotatingSelectorCommand class handles the rotation of selected blocks within the editor.
 * It allows users to rotate blocks around a central point or individually, with optional snapping.
 */
export class RotatingSelectorCommand extends SelectorCommand {

    /**
     * Returns the HTML elements associated with the rotation command.
     * These elements are used to represent the rotation functionality in the UI.
     * 
     * @returns {HTMLElement | HTMLElement[]} The HTML elements for the rotation command.
     */
    public getElements(): HTMLElement | HTMLElement[] {
        return [
            createElementFromHTML(`<div class="rotate"></div>`),
        ];
    }

    /**
     * Executes the rotation command. Handles the rotation logic, including snapping,
     * updating block positions, and recalculating the selection area.
     * 
     * @param {MouseEvent | TouchEvent} event - The event that triggered the command.
     * @param {HTMLElement} element - The HTML element associated with the command.
     * @param {EditorSelectorArea} selectorArea - The selector area where the command is executed.
     */
    public execute(event: MouseEvent | TouchEvent, element: HTMLElement, selectorArea: EditorSelectorArea): void {
        let {x: initialX, y: initialY} = this.getPositionFromEvent(selectorArea, event);
        const PER_OBJECT = selectorArea.getEditor().getPreferences().PER_OBJECT_TRANSFORMATION;
        const SNAPPING_COUNT = selectorArea.getEditor().getPreferences().ROTATION_SNAPPING_COUNT;

        const area = selectorArea.getArea();

        const centerX = area.x + (area.width / 2);
        const centerY = area.y + (area.height / 2);

        let currentAngle = 0;
        let snappedAngle = 0;
        let lastAngle = Math.atan2(initialY - centerY, initialX - centerX);
        const initialPositions = selectorArea.getEditor().getSelector().getSelectedBlocks().map(block => {
            block.processEvent(BlockEvent.ROTATION_STARTED);

            return {
                block,
                rotation: block.rotation,
                offsetX: PER_OBJECT ? 0 : block.position.x + (block.size.width / 2) - centerX,
                offsetY: PER_OBJECT ? 0 : block.position.y + (block.size.height / 2) - centerY,
            }
        });

        const mouseMoveHandler = (event: MouseEvent | TouchEvent) => {
            const {x: currentX, y: currentY} = this.getPositionFromEvent(selectorArea, event);

            const angle = Math.atan2(currentY - centerY, currentX - centerX);

            let diff = angle - lastAngle;

            if (diff > Math.PI) diff -= Math.PI * 2;
            if (diff < -Math.PI) diff += Math.PI * 2;

            currentAngle += diff;

            if (event.shiftKey) {
                snappedAngle = currentAngle - (currentAngle % (2 * Math.PI / SNAPPING_COUNT));
            } else {
                snappedAngle = currentAngle;
            }

            for (const position of initialPositions) {
                const {block, rotation, offsetX, offsetY} = position;

                let rotatedX: number, rotatedY: number;

                // Calculate the rotated position of the block around the center
                if (PER_OBJECT) {
                    rotatedX = block.position.x;
                    rotatedY = block.position.y;
                } else {
                    rotatedX = centerX + offsetX * Math.cos(snappedAngle) - offsetY * Math.sin(snappedAngle);
                    rotatedY = centerY + offsetX * Math.sin(snappedAngle) + offsetY * Math.cos(snappedAngle);

                    rotatedX -= block.size.width / 2;
                    rotatedY -= block.size.height / 2;
                }

                // Set the new position and rotation
                block.move(rotatedX, rotatedY);
                block.rotate(rotation + (snappedAngle * 180) / Math.PI);
            }

            // Update selection area rotation
            selectorArea.rotateSelectionArea((snappedAngle * 180) / Math.PI);

            if (PER_OBJECT) {
                selectorArea.recalculateSelectionArea();
            }

            lastAngle = angle;

            selectorArea.handleSelector();
        };

        const mouseUpHandler = () => {
            window.removeEventListener("mousemove", mouseMoveHandler);
            window.removeEventListener("mouseup", mouseUpHandler);
            window.removeEventListener("touchmove", mouseMoveHandler, {capture: true});
            window.removeEventListener("touchend", mouseUpHandler);
            window.removeEventListener("touchcancel", mouseUpHandler);

            for (const {block, rotation} of initialPositions) {
                block.processEvent(BlockEvent.ROTATION_ENDED, rotation);
            }
            selectorArea.updateSelectionArea();

            // if (PER_OBJECT && selectorArea.getEditor().getSelector().getSelectedBlocks().length !== 1) {
            //     // The rotation is now out of sync with the blocks, so we need to recalculate it
            //     selectorArea.recalculateSelectionArea();
            // }
            selectorArea.recalculateSelectionArea();
        };

        window.addEventListener("mousemove", mouseMoveHandler);
        window.addEventListener("mouseup", mouseUpHandler);
        window.addEventListener("touchmove", mouseMoveHandler, {capture: true});
        window.addEventListener("touchend", mouseUpHandler);
        window.addEventListener("touchcancel", mouseUpHandler);
    }

    /**
     * Extracts the position (x, y) from a mouse or touch event and converts it to editor coordinates.
     * 
     * @param {EditorSelectorArea} selectorArea - The selector area where the event occurred.
     * @param {MouseEvent | TouchEvent} event - The event containing position data.
     * @returns {{x: number, y: number}} The position in editor coordinates.
     * @throws {Error} If the event type is unsupported.
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

}
