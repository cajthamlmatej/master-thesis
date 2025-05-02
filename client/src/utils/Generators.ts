/**
 * Generates a UUID (Universally Unique Identifier).
 * 
 * @returns A UUID string.
 */
export const generateUUID = (): string => {
    return crypto.randomUUID();
}

// @ts-ignore
import {generateMD5} from "@/utils/MD5";

/**
 * Generates a color hex code based on a seed string.
 * 
 * @param seed The seed string to generate the color from.
 * @returns A hex color string.
 */
export const colorFromSeed = (seed: string): string => {
    return "#" + (generateMD5(seed).substring(0, 6));
}

/**
 * Decodes a Base64-encoded string.
 * 
 * @param data The Base64-encoded string.
 * @returns The decoded string.
 */
export const decodeBase64 = (data: string): string => {
    return decodeURIComponent(escape(atob(data)));
}

/**
 * Encodes a string into Base64 format.
 * 
 * @param data The string to encode.
 * @returns The Base64-encoded string.
 */
export const encodeBase64 = (data: string): string => {
    return btoa(unescape(encodeURIComponent(data)));
}

/**
 * Generates a random token of a given length using a specified set of characters.
 * 
 * @param length The length of the token to generate. Default is 32.
 * @param chars The characters to use in the token. Default is alphanumeric characters.
 * @returns The generated token string.
 */
export function generateToken(length: number = 32, chars: string = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890") {
    const a = chars.split("");

    const b = [] as string[];
    for (let i = 0; i < length; i++) {
        let j = Math.floor(Math.random() * (a.length - 1));

        b[i] = a[j];
    }

    return b.join("");
}
