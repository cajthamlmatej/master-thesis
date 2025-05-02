import type {BlockEvent} from "@/editor/block/events/BlockEvent";

export const LISTENER_METADATA_KEY = "block-event-listener";

/**
 * A decorator function used to mark methods as listeners for specific block events.
 * The decorated methods will be invoked when the corresponding event is emitted.
 * 
 * @param event - The block event to listen for.
 * @returns A method decorator that registers the method as a listener for the specified event.
 */
export function BlockEventListener(event: BlockEvent): MethodDecorator {
    return function (
        target: Object,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor
    ): void | TypedPropertyDescriptor<any> {
        const className = target.constructor.name;
        const key = `${LISTENER_METADATA_KEY}:${className}`;

        // If metadata for the class does not exist, initialize it.
        if (Reflect.getMetadata(key, target) === undefined) {
            Reflect.defineMetadata(key, new Map<BlockEvent, Set<string | symbol>>(), target);
        }

        const map = Reflect.getMetadata(key, target) as Map<BlockEvent, Set<string | symbol>>;

        // If the event is not already registered, initialize its listener set.
        if (!map.has(event)) {
            map.set(event, new Set<string | symbol>());
        }

        // Add the method to the set of listeners for the event.
        map.get(event)!.add(propertyKey);

        return descriptor;
    };
}
