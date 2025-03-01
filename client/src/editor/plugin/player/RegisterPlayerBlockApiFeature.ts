import {EditorBlockApiFeature} from "@/editor/plugin/editor/EditorBlockApiFeature";
import {Type} from "@/utils/TypeScriptTypes";
import {PlayerBlockApiFeature} from "@/editor/plugin/player/PlayerBlockApiFeature";
export const BLOCK_API_FEATURE_METADATA_KEY = 'player:block:api-feature';

export interface PlayerBlockApiFeatureEntry {
    apiFeature: Type<PlayerBlockApiFeature>;
}

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
