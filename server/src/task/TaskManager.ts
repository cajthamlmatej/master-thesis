import {Task} from "./Task";
import {Service} from "typedi";

@Service()
export class TaskManager {
    private tasks: Task[] = [];

    public register(task: Task) {
        this.tasks.push(task);
    }

    public process() {
        for (let task of this.tasks) {
            if (task.caller === "MANUAL") {
                console.log(`Task ${task.id}: marked as MANUAL. Skipping...`);
                continue;
            }

            console.log(`Task ${task.id}: marked as AUTOMATIC. Running task...`);

            if (task.interval === undefined) {
                throw new Error(`Task ${task.id}: has no interval. Task is marked as AUTOMATIC, but has no interval.`);
            }

            task.run();

            if (!isFinite(task.interval)) {
                console.log(`Task ${task.id}: has infinite interval and therefore will not be executed again.`);
                continue;
            }

            console.log(`Task ${task.id}: has interval  ${task.interval}ms. Setting up interval...`);

            setInterval(() => {
                console.log(`Task ${task.id}: Running task...`);
                task.run()
            }, task.interval);
        }
    }
}