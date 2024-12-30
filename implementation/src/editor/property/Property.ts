import type {EditorProperty} from "@/editor/property/EditorProperty";
import {EditorBlock} from "@/editor/block/EditorBlock";

export abstract class Property {
    protected element!: HTMLElement;
    protected editorProperty!: EditorProperty;
    protected blocks!: EditorBlock[];

    public initialize(element: HTMLElement, editorProperty: EditorProperty, blocks: EditorBlock[]) {
        this.element = element;
        this.editorProperty = editorProperty;
        this.blocks = blocks;
    }

    public getID(): string {
        return this.constructor.name;
    }

    public abstract isVisible(): boolean;

    public abstract setup(): void;

    public abstract destroy(): void;

    protected lockOnElement(element: HTMLElement, change: (changeX: number, changeY: number) => boolean) {
        element.addEventListener('mousedown', (e) => {
            // Lock cursor
            element!.requestPointerLock();

            const cursorVisual = document.createElement('div');
            cursorVisual.style.position = 'fixed';
            cursorVisual.style.width = '10px';
            cursorVisual.style.height = '10px';
            cursorVisual.style.borderRadius = '50%';
            cursorVisual.style.backgroundColor = 'red';
            cursorVisual.style.zIndex = '1000';
            cursorVisual.style.pointerEvents = 'none';
            cursorVisual.style.left = e.clientX + 'px';
            cursorVisual.style.top = e.clientY + 'px';
            document.body.appendChild(cursorVisual);

            const start = { x: e.clientX, y: e.clientY };
            const current = { x: e.clientX, y: e.clientY };

            const onMouseMove = (e: MouseEvent) => {
                // Update `current` values
                current.x += e.movementX;
                current.y += e.movementY;

                // Calculate deltas relative to start
                const deltaX = current.x - start.x;
                const deltaY = current.y - start.y;

                // Try resizing blocks
                let changeSuccessful = change(deltaX, deltaY);

                // Only update cursor visual if resize was successful
                if (changeSuccessful) {
                    cursorVisual.style.left = `${parseFloat(cursorVisual.style.left) + e.movementX}px`;
                    cursorVisual.style.top = `${parseFloat(cursorVisual.style.top) + e.movementY}px`;

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
                cursorVisual.remove();
            }

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    }
}
