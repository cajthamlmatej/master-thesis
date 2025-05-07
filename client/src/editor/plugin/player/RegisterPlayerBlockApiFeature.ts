import {Type} from "@/utils/TypeScriptTypes";
import {PlayerBlockApiFeature} from "@/editor/plugin/player/PlayerBlockApiFeature";

/**
 * Metadata key used to store PlayerBlock API feature information.
 */
export const BLOCK_API_FEATURE_METADATA_KEY = 'player:block:api-feature';

/**
 * Represents an entry for a PlayerBlock API feature.
 */
export interface PlayerBlockApiFeatureEntry {
    /**
     * The type of the PlayerBlockApiFeature.
     */
    apiFeature: Type<PlayerBlockApiFeature>;
}

/**
 * Decorator to register a PlayerBlock API feature.
 * 
 * @param apiFeature - The type of the PlayerBlockApiFeature to register.
 * @returns A class decorator function.
 */
export function RegisterPlayerBlockApiFeature(apiFeature: Type<PlayerBlockApiFeature>): ClassDecorator {
    return function (
        target: Function
    ) {
        const className = target.name;
        const key = `${BLOCK_API_FEATURE_METADATA_KEY}:${className}`;

        if (Reflect.getMetadata(key, target) === undefined) {
            Reflect.defineMetadata(key, new Set<PlayerBlockApiFeatureEntry>(), target);
        }

        const set = Reflect.getMetadata(key, target) as Set<PlayerBlockApiFeatureEntry>;

        set.add({
            apiFeature: apiFeature
        });
    };
}
