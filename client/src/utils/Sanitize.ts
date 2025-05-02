import sanitizeHtml from 'sanitize-html';

/**
 * Sanitizes an attribute string by removing all tags and attributes.
 * 
 * @param attribute The attribute string to sanitize.
 * @returns The sanitized attribute string.
 */
export const sanitizeAttribute = (attribute: string) => {
    return sanitizeHtml(attribute, {
        allowedTags: [],
        allowedAttributes: {}
    });
}

/**
 * Sanitizes HTML content, allowing only basic formatting tags (b, i, u).
 * 
 * @param content The HTML content to sanitize.
 * @returns The sanitized HTML content.
 */
export const sanitizeHtmlContent = (content: string) => {
    return sanitizeHtml(content, {
        allowedTags: ["b", "i", "u"],
        allowedAttributes: {}
    });
}

/**
 * Sanitizes an SVG string, allowing only specific tags and attributes.
 * 
 * @param svg The SVG string to sanitize.
 * @returns The sanitized SVG string.
 */
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
