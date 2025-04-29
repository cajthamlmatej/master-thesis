/**
 * Generates a random token of a given length using a given set of characters
 * @param length The length of the token to generate
 * @param chars The characters to use in the token
 */
export default function generateToken(length: number = 32, chars: string = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890") {
    const a = chars.split("");

    const b = [] as string[];
    for (let i = 0; i < length; i++) {
        let j = Math.floor(Math.random() * (a.length - 1));

        b[i] = a[j];
    }

    return b.join("");
}