/**
 * Calculates the coordinates of the four corners of a rectangle after rotating it around its center.
 * 
 * @param x The x-coordinate of the top-left corner of the rectangle.
 * @param y The y-coordinate of the top-left corner of the rectangle.
 * @param width The width of the rectangle.
 * @param height The height of the rectangle.
 * @param angle The rotation angle in degrees.
 * @returns An array of points representing the rotated rectangle's corners.
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
