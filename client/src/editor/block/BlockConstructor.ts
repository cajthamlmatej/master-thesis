import {BlockInteractivity} from "@/editor/interactivity/BlockInteractivity";

/**
 * Represents the structure of a block in the editor or player.
 * Contains properties for positioning, size, rotation, and other attributes.
 */
export interface BlockConstructor {
    /** The unique identifier of the block. */
    id: string;

    /** The type of the block (e.g., "text", "image"). */
    type: string;

    /** The position of the block on the canvas. */
    position: { x: number, y: number };

    /** The size of the block. */
    size: { width: number, height: number };

    /** The rotation angle of the block in degrees. */
    rotation: number;

    /** The z-index of the block for layering. */
    zIndex: number;

    /** The opacity of the block (optional). */
    opacity?: number;

    /** Whether the block is locked (optional). */
    locked?: boolean;

    /** The group to which the block belongs (optional). */
    group?: string;

    /** The interactivity settings for the block (optional). */
    interactivity?: BlockInteractivity[];
}

/**
 * Represents a block structure without the "type" property.
 * Useful for scenarios where the block type is determined separately.
 */
export type BlockConstructorWithoutType = Omit<BlockConstructor, "type">;
