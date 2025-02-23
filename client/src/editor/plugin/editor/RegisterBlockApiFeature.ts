import {BlockApiFeature} from "@/editor/plugin/editor/api/BlockApiFeature";
import {Type} from "@/utils/TypeScriptTypes";
export const BLOCK_API_FEATURE_METADATA_KEY = 'block:api-feature';

export interface BlockApiFeatureEntry {
    apiFeature: Type<BlockApiFeature>;
}

export function RegisterBlockApiFeature(apiFeature: Type<BlockApiFeature>): ClassDecorator {
    return function (
        target: Function
    ) {
        const className = target.name;
        const key = `${BLOCK_API_FEATURE_METADATA_KEY}:${className}`;

        if (Reflect.getMetadata(key, target) === undefined) {
            Reflect.defineMetadata(key, new Set<BlockApiFeatureEntry>(), target);
        }

        const set = Reflect.getMetadata(key, target) as Set<BlockApiFeatureEntry>;

        set.add({
            apiFeature: apiFeature
        });
    };
}
