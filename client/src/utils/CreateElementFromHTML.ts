/**
 * Creates an HTML element from a string of HTML.
 * 
 * @param html The HTML string to convert into an element.
 * @returns The created HTML element.
 */
export function createElementFromHTML(html: string) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild as HTMLElement;
}
