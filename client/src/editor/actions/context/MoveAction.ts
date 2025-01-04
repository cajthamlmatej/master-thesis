import type {ActionKeybind, ActionParameters} from "@/editor/actions/EditorAction";
import {ContextAction} from "@/editor/actions/ContextAction";

export class MoveAction extends ContextAction {
    private static readonly directionMap: { [key: string]: { x: number, y: number } } = {
        ArrowUp: {x: 0, y: -1},
        ArrowDown: {x: 0, y: 1},
        ArrowRight: {x: 1, y: 0},
        ArrowLeft: {x: -1, y: 0},
    };

    constructor() {
        super("move", "Move");
    }

    override isVisible(param: ActionParameters) {
        return false; // Never show up in the context menu, but can be triggered by keybinds
    }

    override run(param: ActionParameters) {
        const direction = MoveAction.directionMap[param.keybind?.key ?? 'ArrowRight'];

        const directionX = direction.x * (param.keybind?.ctrlKey ? 10 : 1);
        const directionY = direction.y * (param.keybind?.ctrlKey ? 10 : 1);

        for (const block of param.selected) {
            if (block.editorSupport().selection && block.editorSupport().movement) {
                block.move(block.position.x + directionX, block.position.y + directionY, false, true);
            }
        }
    }

    override getKeybinds(): ActionKeybind[] {
        let keybinds: ActionKeybind[] = [];

        for (const key of Object.keys(MoveAction.directionMap)) {
            keybinds.push({
                key: key,
                ctrlKey: 'OPTIONAL',
                shiftKey: 'NEVER',
                altKey: 'NEVER',
                mode: 'ALWAYS'
            });
        }

        return keybinds;
    };
}
