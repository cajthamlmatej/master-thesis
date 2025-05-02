/**
 * Represents the options for configuring a material.
 */
export interface MaterialOptions {
    /**
     * The size of the material, including width and height.
     */
    size: {
        /**
         * The width of the material.
         */
        width: number;

        /**
         * The height of the material.
         */
        height: number;
    },

    /**
     * The color of the material.
     */
    color: string;
}
