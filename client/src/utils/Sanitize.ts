import sanitizeHtml, { IOptions } from 'sanitize-html';

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

export const sanitizeTiptapEditorHTML = (html: string): string => {
  const options: IOptions = {
    allowedTags: [
      'p', 'h1','h2','h3','h4','h5','h6',
      'blockquote','pre','code',
      'ul','ol','li','hr','br',
      'strong','em','s', 
      'u','sup','sub',
      'span',
    ],

    allowedAttributes: {
      p:     ['style'],
      h1:    ['style'],
      h2:    ['style'],
      h3:    ['style'],
      h4:    ['style'],
      h5:    ['style'],
      h6:    ['style'],
      span:  ['style'],
    },

    allowedStyles: {
      '*': {
        'text-align': [
          /^left$/, /^right$/, /^center$/, /^justify$/
        ],
      },
      span: {
        'color': [
          /^#([0-9a-f]{3}|[0-9a-f]{6})$/i,
          /^rgb\(\d+,\s*\d+,\s*\d+\)$/,
          /^rgba\(\d+,\s*\d+,\s*\d+,\s*(0|0?\.\d+|1(\.0)?)\)$/
        ],
        'font-family': [
          /^[-\w'"(),\s]+$/
        ],
        'font-size': [
          /^\d+(?:px|em|rem|%)$/
        ],
      },
    },

    disallowedTagsMode: 'discard',
    allowedSchemes: [ 'http', 'https', 'mailto' ],
  };

  return sanitizeHtml(html, options);
};
