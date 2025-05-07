/**
 * Represents a generic type that can be instantiated with the `new` keyword.
 * @template T The type of the instance created by the constructor.
 */
export interface Type<T> extends Function {
    new(...args: any[]): T;
}
