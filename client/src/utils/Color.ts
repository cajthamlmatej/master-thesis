/**
 * Interpolates between two colors based on a factor.
 * 
 * @param f The interpolation factor (0 to 1).
 * @param color1 The first color in hex format.
 * @param color2 The second color in hex format.
 * @returns The interpolated color in hex format.
 */
export const interpolateColor = (f: number, color1: string, color2: string) => {
    if (f > 1) f = 1;
    if (f < 0) f = 0;

    const c0 = color1.match(/.{1,2}/g)?.map((oct) => parseInt(oct, 16) * (1 - f));
    const c1 = color2.match(/.{1,2}/g)?.map((oct) => parseInt(oct, 16) * f);

    if (!c0 || !c1) return "#2d2d2d";

    let ci = [0, 1, 2].map((i) => Math.min(Math.round(c0[i] + c1[i]), 255));

    return (
        "#" +
        ci
            .reduce((a, v) => (a << 8) + v, 0)
            .toString(16)
            .padStart(6, "0")
    );
}
