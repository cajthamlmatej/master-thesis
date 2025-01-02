export interface Task {
    readonly id: string;
    readonly interval?: number;
    readonly caller: "AUTOMATIC" | "MANUAL";

    run(): Promise<void>;
}