export const SERIALIZER_METADATA_KEY = 'block:serializer';

/**
 * Entry for a property that should be serialized.
 */
export interface SerializeEntry {
    /**
     * Key to save the property under.
     */
    key: string;
    /**
     * Property key to get the value from.
     */
    propertyKey: string;
}

/**
 * Marks a property as serializable for a block. The property will be added with the key to the serialized data.
 *
 * If key is not provided, the property key will be used as the key in the serialized data.
 * @constructor
 */
export function BlockSerialize(keyToSave?: string): PropertyDecorator {
    return function (
        target: Object,
        propertyKey: string | symbol
    ) {
        const className = target.constructor.name;
        const key = `${SERIALIZER_METADATA_KEY}:${className}`;

        if (Reflect.getMetadata(key, target) === undefined) {
            Reflect.defineMetadata(key, new Set<SerializeEntry>(), target);
        }

        const set = Reflect.getMetadata(key, target) as Set<SerializeEntry>;

        set.add({
            key: keyToSave || propertyKey.toString(),
            propertyKey: propertyKey.toString()
        });
    };
}
