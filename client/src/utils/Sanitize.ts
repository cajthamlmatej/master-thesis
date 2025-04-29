import sanitizeHtml from 'sanitize-html';

export const sanitizeAttribute = (attribute: string) => {
    return sanitizeHtml(attribute, {
        allowedTags: [],
        allowedAttributes: {}
    });
}

export const sanitizeHtmlContent = (content: string) => {
    return sanitizeHtml(content, {
        allowedTags: ["b", "i", "u"],
        allowedAttributes: {}
    });
}

export const sanitizeSvg = (svg: string) => {
    return sanitizeHtml(svg, {
        allowedTags: ['svg', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'g'],
        allowedAttributes: {
            '*': ['style', 'class'],
            'svg': ['width', 'height', 'viewBox', 'xmlns', 'xmlns:xlink'],
            'path': ['d', 'fill', 'stroke', 'stroke-width', 'stroke-opacity', 'stroke-linecap']
        }
    });
}
