/**
 * Normalizes a string by converting it to lowercase, removing diacritical marks,
 * and replacing spaces with hyphens.
 *
 * @param str - The input string to normalize.
 * @returns The normalized string.
 */
export const normalizeString = (str: string) => {
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/g, '-');
}