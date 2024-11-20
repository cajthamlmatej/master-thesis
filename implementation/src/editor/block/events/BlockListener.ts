import type {BlockEvent} from "@/editor/block/events/BlockEvent";

export const LISTENER_METADATA_KEY = "block-event-listener";

/**
 * Decorator for block event listeners that will be called when the event is emitted.
 * @param event
 * @constructor
 */
export function BlockEventListener(event: BlockEvent): MethodDecorator {
    return function (
        target: Object,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor
    ): void | TypedPropertyDescriptor<any> {
        const className = target.constructor.name;
        const key = `${LISTENER_METADATA_KEY}:${className}`;

        if(Reflect.getMetadata(key, target) === undefined) {
            Reflect.defineMetadata(key, new Map<BlockEvent, Set<string | symbol>>(), target);
        }

        const map = Reflect.getMetadata(key, target) as Map<BlockEvent, Set<string | symbol>>;

        if(!map.has(event)) {
            map.set(event, new Set<string | symbol>());
        }

        map.get(event)!.add(propertyKey);

        return descriptor;
    };
}
