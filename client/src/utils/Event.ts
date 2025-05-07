/**
 * A generic event class that allows subscribing, unsubscribing, and emitting events.
 * 
 * @template P The type of the event payload.
 */
export default class Event<P> {
    private listeners: ((event: P) => void)[] = [];

    /**
     * Subscribes a listener to the event.
     * 
     * @param listener The listener function to subscribe.
     */
    public on(listener: (event: P) => void) {
        this.listeners.push(listener);
    }

    /**
     * Unsubscribes a listener from the event.
     * 
     * @param listener The listener function to unsubscribe.
     */
    public off(listener: (event: P) => void) {
        this.listeners = this.listeners.filter(l => l !== listener);
    }

    /**
     * Emits the event to all subscribed listeners.
     * 
     * @param payload The payload to pass to the listeners.
     */
    public emit(payload: P) {
        for (const listener of this.listeners) {
            listener(payload);
        }
    }
}
