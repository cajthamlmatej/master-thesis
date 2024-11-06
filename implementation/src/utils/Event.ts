export default class Event<P> {
    private listeners: ((event: P) => void)[] = [];

    public on(listener: (event: P) => void) {
        this.listeners.push(listener);
    }

    public off(listener: (event: P) => void) {
        this.listeners = this.listeners.filter(l => l !== listener);
    }

    public emit(payload: P) {
        for (const listener of this.listeners) {
            listener(payload);
        }
    }
}
