// Based on: https://stackoverflow.com/questions/1848445/duplicating-an-element-and-its-style-with-javascript

/**
 * Synchronizes the computed CSS styles from a source element to a destination element.
 * Optionally applies the synchronization recursively to all child elements.
 * 
 * @param src The source HTML element.
 * @param destination The destination HTML element.
 * @param recursively Whether to apply the synchronization recursively to child elements.
 */
export function synchronizeCssStyles(src: HTMLElement, destination: HTMLElement, recursively: boolean) {
    cloneComputed(src, destination);

    if (recursively) {
        const vSrcElements = src.getElementsByTagName("*");
        const vDstElements = destination.getElementsByTagName("*");

        for (let i = vSrcElements.length; i--;) {
            const vSrcElement = vSrcElements[i] as HTMLElement;
            const vDstElement = vDstElements[i] as HTMLElement;

            cloneComputed(vSrcElement, vDstElement);
        }
    }

}

/**
 * Copies the computed CSS styles from a source element to a destination element.
 * 
 * @param src The source HTML element.
 * @param destination The destination HTML element.
 */
function cloneComputed(src: HTMLElement, destination: HTMLElement) {
    const baseStyle = document.defaultView?.getComputedStyle(src, null);

    if (!baseStyle) return;

    const keys = Object.keys(baseStyle);

    for (let key of keys) {
        const value = baseStyle.getPropertyValue(key);
        destination.style.setProperty(key, value);
    }
}
