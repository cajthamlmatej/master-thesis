/**
 * Check is two convex polygons intersect each other.
 *
 * Source: https://stackoverflow.com/questions/10962379/how-to-check-intersection-between-2-rotated-rectangles
 * @param a polygon made of points {x, y}
 * @param b polygon made of points {x, y}
 */
export const twoPolygonsIntersect = (a: { x: number, y: number }[], b: { x: number, y: number }[]) => {
    let polygons = [a, b];
    let minA: number | undefined, maxA: number | undefined, projected, i, i1, j, minB, maxB;

    for (i = 0; i < polygons.length; i++) {
        let polygon = polygons[i];
        for (i1 = 0; i1 < polygon.length; i1++) {

            let i2 = (i1 + 1) % polygon.length;
            let p1 = polygon[i1];
            let p2 = polygon[i2];

            let normal = {x: p2.y - p1.y, y: p1.x - p2.x};

            minA = maxA = undefined;
            for (j = 0; j < a.length; j++) {
                projected = normal.x * a[j].x + normal.y * a[j].y;
                if (minA == undefined || projected < minA) {
                    minA = projected;
                }
                if (maxA == undefined || projected > maxA) {
                    maxA = projected;
                }
            }

            minB = maxB = undefined;
            for (j = 0; j < b.length; j++) {
                projected = normal.x * b[j].x + normal.y * b[j].y;
                if (minB == undefined || projected < minB) {
                    minB = projected;
                }
                if (maxB == undefined || projected > maxB) {
                    maxB = projected;
                }
            }

            if ((maxA == undefined || minB == undefined || minA == undefined || maxB == undefined) || maxA < minB || maxB < minA) {
                return false;
            }
        }
    }
    return true;
}
