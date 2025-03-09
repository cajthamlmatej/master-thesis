import {EditorBlockApiFeature} from "@/editor/plugin/editor/EditorBlockApiFeature";
import {Type} from "@/utils/TypeScriptTypes";

export const BLOCK_API_FEATURE_METADATA_KEY = 'editor:block:api-feature';

export interface EditorBlockApiFeatureEntry {
    apiFeature: Type<EditorBlockApiFeature>;
}

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
