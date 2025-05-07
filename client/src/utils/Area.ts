import type Editor from "@/editor/Editor";

/**
 * Represents a rectangular area with x, y coordinates, width, and height.
 */
export interface Area {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Calculates the bounding box of a set of elements within an editor.
 * 
 * @param elements The elements to calculate the bounding box for.
 * @param editor The editor instance to use for coordinate transformations.
 * @returns The bounding box as an `Area` object.
 */
export const boundingBoxOfElements = (elements: Element[], editor: Editor): Area => {
    let x = 0;
    let y = 0;
    let width = 0;
    let height = 0;

    for (const element of elements) {
        const boundingClientRect = element.getBoundingClientRect();

        if (x === 0 || boundingClientRect.left < x) {
            x = boundingClientRect.left;
        }

        if (y === 0 || boundingClientRect.top < y) {
            y = boundingClientRect.top;
        }

        if (boundingClientRect.right > width) {
            width = boundingClientRect.right;
        }

        if (boundingClientRect.bottom > height) {
            height = boundingClientRect.bottom;
        }
    }

    let inEditor = editor.screenToEditorCoordinates(x, y);

    // Offset the x and y to the editor
    let offset = editor.getOffset();
    width -= offset.x;
    height -= offset.y;

    width /= editor.getScale();
    height /= editor.getScale();

    return {
        x: inEditor.x,
        y: inEditor.y,
        width: width - inEditor.x,
        height: height - inEditor.y,
    } as Area;
}
