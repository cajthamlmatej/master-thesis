export const shuffle = (array: any[] | undefined): any[] | undefined => {
    if (!array) return undefined;

    return array.sort(() => Math.random() - 0.5);
}