export const generateUUID = (): string => {
    return crypto.randomUUID();
}

// @ts-ignore
import {generateMD5} from "@/utils/MD5";

export const colorFromSeed = (seed: string): string => {
    return "#" + (generateMD5(seed).substring(0, 6));
}

export const decodeBase64 = (data: string): string => {
    return decodeURIComponent(escape(atob(data)));
}
export const encodeBase64 = (data: string): string => {
    return btoa(unescape(encodeURIComponent(data)));
}
