import {BlockInteractivity} from "@/editor/interactivity/BlockInteractivity";

export interface BlockConstructor {
    id: string;
    type: string;
    position: { x: number, y: number };
    size: { width: number, height: number };
    rotation: number;
    zIndex: number;
    locked?: boolean;
    group?: string;
    interactivity?: BlockInteractivity[];
}

export type BlockConstructorWithoutType = Omit<BlockConstructor, "type">;
