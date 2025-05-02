import {EditorBlockApiFeature} from "@/editor/plugin/editor/EditorBlockApiFeature";
import {Type} from "@/utils/TypeScriptTypes";

/**
 * Metadata key used to store API feature metadata for editor blocks.
 */
export const BLOCK_API_FEATURE_METADATA_KEY = 'editor:block:api-feature';

/**
 * Represents an entry for an editor block API feature.
 */
export interface EditorBlockApiFeatureEntry {
    /**
     * The API feature class associated with the editor block.
     */
    apiFeature: Type<EditorBlockApiFeature>;
}

/**
 * Class decorator to register an API feature for an editor block.
 * 
 * @param apiFeature - The API feature class to register.
 * @returns A class decorator function.
 */
export function RegisterEditorBlockApiFeature(apiFeature: Type<EditorBlockApiFeature>): ClassDecorator {
    return function (
        target: Function
    ) {
        const className = target.name;
        const key = `${BLOCK_API_FEATURE_METADATA_KEY}:${className}`;

        if (Reflect.getMetadata(key, target) === undefined) {
            Reflect.defineMetadata(key, new Set<EditorBlockApiFeatureEntry>(), target);
        }

        const set = Reflect.getMetadata(key, target) as Set<EditorBlockApiFeatureEntry>;

        set.add({
            apiFeature: apiFeature
        });
    };
}
