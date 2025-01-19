import {SelectorCommand} from "@/editor/selector/area/SelectorCommand";
import type EditorSelectorArea from "@/editor/selector/area/EditorSelectorArea";
import {BlockEvent} from "@/editor/block/events/BlockEvent";
import {createElementFromHTML} from "@/utils/CreateElementFromHTML";

export class RotatingSelectorCommand extends SelectorCommand {

    public getElements(): HTMLElement | HTMLElement[] {
        return [
            createElementFromHTML(`<div class="rotate"></div>`),
        ]
    }

    public execute(event: MouseEvent, element: HTMLElement, selectorArea: EditorSelectorArea): void {
        let {x: initialX, y: initialY} = selectorArea.getEditor().screenToEditorCoordinates(event.clientX, event.clientY);
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

        const mouseMoveHandler = (event: MouseEvent) => {
            const {x: currentX, y: currentY} = selectorArea.getEditor().screenToEditorCoordinates(
                event.clientX,
                event.clientY
            );

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

            if(PER_OBJECT) {
                selectorArea.recalculateSelectionArea();
            }

            lastAngle = angle;

            selectorArea.handleSelector();
        };

        const mouseUpHandler = () => {
            window.removeEventListener("mousemove", mouseMoveHandler);
            window.removeEventListener("mouseup", mouseUpHandler);

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
    }

}
