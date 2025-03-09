import {SelectorCommand} from "@/editor/selector/area/SelectorCommand";
import type EditorSelectorArea from "@/editor/selector/area/EditorSelectorArea";
import {BlockEvent} from "@/editor/block/events/BlockEvent";
import {createElementFromHTML} from "@/utils/CreateElementFromHTML";


export class MovingSelectorCommand extends SelectorCommand {

    public getElements(): HTMLElement | HTMLElement[] {
        return [
            createElementFromHTML(`<div class="move move--top"></div>`),
            createElementFromHTML(`<div class="move move--right"></div>`),
            createElementFromHTML(`<div class="move move--bottom"></div>`),
            createElementFromHTML(`<div class="move move--left"></div>`),
        ]
    }

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


    public execute(event: MouseEvent | TouchEvent, element: HTMLElement, selectorArea: EditorSelectorArea): void {
        event.preventDefault();
        event.stopPropagation();

        let {x: initialX, y: initialY} = this.getPositionFromEvent(selectorArea, event);

        const initialPositions = selectorArea.getEditor().getSelector().getSelectedBlocks().map(block => {
            block.processEvent(BlockEvent.MOVEMENT_STARTED);

            return {
                block,
                x: block.position.x,
                y: block.position.y
            };
        });

        const mouseMoveHandler = (event: MouseEvent | TouchEvent) => {
            let {x: deltaX, y: deltaY} = this.getPositionFromEvent(selectorArea, event);

            for (const {block, x, y} of initialPositions) {
                block.move(x + deltaX - initialX, y + deltaY - initialY);

                block.element.blur();
            }

            selectorArea.moveSelectionArea(deltaX - initialX, deltaY - initialY);
            selectorArea.handleSelector();
        };

        const mouseUpHandler = () => {
            window.removeEventListener("mousemove", mouseMoveHandler);
            window.removeEventListener("mouseup", mouseUpHandler);
            window.removeEventListener("touchmove", mouseMoveHandler);
            window.removeEventListener("touchend", mouseUpHandler);
            window.removeEventListener("touchcancel", mouseUpHandler);

            for (const {block, x, y} of initialPositions) {
                block.processEvent(BlockEvent.MOVEMENT_ENDED, {x: x, y: y});
            }

            selectorArea.handleSelector();
            //this.recalculateSelectionArea();
            selectorArea.updateSelectionArea();
        };

        window.addEventListener("mousemove", mouseMoveHandler);
        window.addEventListener("mouseup", mouseUpHandler);
        window.addEventListener("touchmove", mouseMoveHandler);
        window.addEventListener("touchend", mouseUpHandler);
        window.addEventListener("touchcancel", mouseUpHandler);
    }

}
