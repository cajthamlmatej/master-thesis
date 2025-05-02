/**
 * Metadata key used to store serialization information for block properties.
 */
export const SERIALIZER_METADATA_KEY = 'block:serializer';

/**
 * Represents an entry for a property that should be serialized.
 */
export interface SerializeEntry {
    /**
     * Key to save the property under in the serialized data.
     */
    key: string;
    /**
     * Property key to get the value from.
     */
    propertyKey: string;
}

/**
 * Marks a property as serializable for a block. The property will be added with the specified key to the serialized data.
 *
 * If no key is provided, the property key will be used as the key in the serialized data.
 * @param keyToSave - Optional key to save the property under.
 * @returns A property decorator function.
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
