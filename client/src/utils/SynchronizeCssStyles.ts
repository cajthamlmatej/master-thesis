// Based on: https://stackoverflow.com/questions/1848445/duplicating-an-element-and-its-style-with-javascript
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

function cloneComputed(src: HTMLElement, destination: HTMLElement) {
    const baseStyle = document.defaultView?.getComputedStyle(src, null);

    if (!baseStyle) return;

    const keys = Object.keys(baseStyle);

    for (let key of keys) {
        const value = baseStyle.getPropertyValue(key);
        destination.style.setProperty(key, value);
    }
}
