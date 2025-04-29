import {SelectorCommand} from "@/editor/selector/area/SelectorCommand";
import type EditorSelectorArea from "@/editor/selector/area/EditorSelectorArea";
import {BlockEvent} from "@/editor/block/events/BlockEvent";
import {createElementFromHTML} from "@/utils/CreateElementFromHTML";
import {getRotatedRectanglePoints} from "@/utils/spaceManipulation";


export class MovingSelectorCommand extends SelectorCommand {

    public getElements(): HTMLElement | HTMLElement[] {
        return [
            createElementFromHTML(`<div class="move move--top"></div>`),
            createElementFromHTML(`<div class="move move--right"></div>`),
            createElementFromHTML(`<div class="move move--bottom"></div>`),
            createElementFromHTML(`<div class="move move--left"></div>`),
        ]
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

            const shouldSnap = event.shiftKey;
            const snapDistance = selectorArea.getEditor().getPreferences().MOVEMENT_SNAPPING_DISTANCE;
            if (shouldSnap) {
                selectorArea.getEditor().getSnapping().processVisibility(true);
            } else {
                selectorArea.getEditor().getSnapping().processVisibility(false);
            }

            for (const {block, x, y} of initialPositions) {
                const lines = selectorArea.getEditor().getSnapping().getLines();

                let newX = x + deltaX - initialX;
                let newY = y + deltaY - initialY;

                if (shouldSnap) {
                    const rotated = getRotatedRectanglePoints(newX, newY, block.size.width, block.size.height, block.rotation);

                    const blockLeft = Math.min(...rotated.map(p => p.x));
                    const blockRight = Math.max(...rotated.map(p => p.x));
                    const blockTop = Math.min(...rotated.map(p => p.y));
                    const blockBottom = Math.max(...rotated.map(p => p.y));

                    let closestLineVertical = null;
                    let minDistanceVertical = Infinity;
                    let snappedEdgeVertical = null;

                    for (let line of lines.vertical) {
                        const distLeft = Math.abs(line - blockLeft);
                        const distRight = Math.abs(line - blockRight);

                        if (distLeft < minDistanceVertical && distLeft < snapDistance) {
                            closestLineVertical = line;
                            minDistanceVertical = distLeft;
                            snappedEdgeVertical = 'left';
                        }

                        if (distRight < minDistanceVertical && distRight < snapDistance) {
                            closestLineVertical = line;
                            minDistanceVertical = distRight;
                            snappedEdgeVertical = 'right';
                        }
                    }

                    let closestLineHorizontal = null;
                    let minDistanceHorizontal = Infinity;
                    let snappedEdgeHorizontal = null;

                    for (let line of lines.horizontal) {
                        const distTop = Math.abs(line - blockTop);
                        const distBottom = Math.abs(line - blockBottom);

                        if (distTop < minDistanceHorizontal && distTop < snapDistance) {
                            closestLineHorizontal = line;
                            minDistanceHorizontal = distTop;
                            snappedEdgeHorizontal = 'top';
                        }

                        if (distBottom < minDistanceHorizontal && distBottom < snapDistance) {
                            closestLineHorizontal = line;
                            minDistanceHorizontal = distBottom;
                            snappedEdgeHorizontal = 'bottom';
                        }
                    }

                    if (closestLineHorizontal && closestLineVertical) {
                        if (minDistanceHorizontal < minDistanceVertical) {
                            closestLineVertical = null;
                        } else {
                            closestLineHorizontal = null;
                        }
                    }

                    if (closestLineVertical !== null) {
                        const snapDelta =
                            snappedEdgeVertical === 'left'
                                ? closestLineVertical - blockLeft
                                : closestLineVertical - blockRight;

                        const angle = -block.rotation * (Math.PI / 180);
                        const dx = Math.cos(angle) * snapDelta;
                        const dy = Math.sin(angle) * snapDelta;

                        newX += dx;
                        newY += dy;
                    }

                    if (closestLineHorizontal !== null) {
                        const snapDelta =
                            snappedEdgeHorizontal === 'top'
                                ? closestLineHorizontal - blockTop
                                : closestLineHorizontal - blockBottom;

                        const angle = -block.rotation * (Math.PI / 180);
                        const dx = -Math.sin(angle) * snapDelta;
                        const dy = Math.cos(angle) * snapDelta;

                        newX += dx;
                        newY += dy;
                    }
                }

                block.move(newX, newY);

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

            selectorArea.getEditor().getSnapping().processVisibility(false);
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
