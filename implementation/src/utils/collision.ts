export const twoPolygonsIntersect = (polygon1: { x: number, y: number }[], polygon2: { x: number, y: number }[]) => {
    const getEdges = (polygon: { x: number, y: number }[]) => {
        const edges: { x: number, y: number }[] = [];
        for (let i = 0; i < polygon.length; i++) {
            const nextIndex = (i + 1) % polygon.length;
            edges.push({
                x: polygon[nextIndex].x - polygon[i].x,
                y: polygon[nextIndex].y - polygon[i].y
            });
        }
        return edges;
    };

    const projectPolygon = (polygon: { x: number, y: number }[], axis: { x: number, y: number }) => {
        let min = Infinity;
        let max = -Infinity;

        for (const vertex of polygon) {
            const projection = (vertex.x * axis.x + vertex.y * axis.y);
            if (projection < min) min = projection;
            if (projection > max) max = projection;
        }

        return { min, max };
    };

    const overlap = (minA: number, maxA: number, minB: number, maxB: number) => {
        return maxA >= minB && maxB >= minA;
    };

    const edges1 = getEdges(polygon1);
    const edges2 = getEdges(polygon2);

    for (const edge of [...edges1, ...edges2]) {
        // Get the perpendicular axis to the edge
        const axis = { x: -edge.y, y: edge.x };

        // Project both polygons onto the axis
        const { min: minA, max: maxA } = projectPolygon(polygon1, axis);
        const { min: minB, max: maxB } = projectPolygon(polygon2, axis);

        // Check for overlap
        if (!overlap(minA, maxA, minB, maxB)) {
            return false; // No intersection
        }
    }

    return true; // Intersecting
}
