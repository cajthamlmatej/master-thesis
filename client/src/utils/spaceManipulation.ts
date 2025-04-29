/**
 * Rotate a rectangle around its center.
 * @param x
 * @param y
 * @param width
 * @param height
 * @param angle in degrees
 */
export const getRotatedRectanglePoints = (x: number, y: number, width: number, height: number, angle: number) => {
    const angleInRadians = angle * (Math.PI / 180);

    const corners = [
        {x: x, y: y},
        {x: x, y: y + height},
        {x: x + width, y: y + height},
        {x: x + width, y: y},
    ];

    const pivot = {x: x + width / 2, y: y + height / 2};

    return corners.map(corner => {
        const relativeX = corner.x - pivot.x;
        const relativeY = corner.y - pivot.y;

        const rotatedX = relativeX * Math.cos(angleInRadians) - relativeY * Math.sin(angleInRadians) + pivot.x;
        const rotatedY = relativeX * Math.sin(angleInRadians) + relativeY * Math.cos(angleInRadians) + pivot.y;

        return {x: rotatedX, y: rotatedY};
    });
}
