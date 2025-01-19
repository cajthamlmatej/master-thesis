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

    public execute(event: MouseEvent, element: HTMLElement, selectorArea: EditorSelectorArea): void {
        event.preventDefault();
        event.stopPropagation();
        let {x: initialX, y: initialY} = selectorArea.getEditor().screenToEditorCoordinates(event.clientX, event.clientY);

        const initialPositions = selectorArea.getEditor().getSelector().getSelectedBlocks().map(block => {
            block.processEvent(BlockEvent.MOVEMENT_STARTED);

            return {
                block,
                x: block.position.x,
                y: block.position.y
            };
        });

        const mouseMoveHandler = (event: MouseEvent) => {
            let {x: deltaX, y: deltaY} = selectorArea.getEditor().screenToEditorCoordinates(event.clientX, event.clientY);

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

            for (const {block, x, y} of initialPositions) {
                block.processEvent(BlockEvent.MOVEMENT_ENDED, {x: x, y: y});
            }

            selectorArea.handleSelector();
            //this.recalculateSelectionArea();
            selectorArea.updateSelectionArea();
        };

        window.addEventListener("mousemove", mouseMoveHandler);
        window.addEventListener("mouseup", mouseUpHandler);
    }

}
