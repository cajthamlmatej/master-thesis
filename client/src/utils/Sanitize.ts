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
