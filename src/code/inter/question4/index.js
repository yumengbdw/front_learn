class TaskScheduler {
    constructor() {
        this.tasks = [];
        this.isPaused = false;
        this.isStopped = false;
        this.currentTaskIndex = 0;
    }

    addTask(id, func, delay = 0, retryCount = 5) {
        this.tasks.push({ id, func, delay, retryCount, attempts: 0 });
    }

    start() {
        if (this.isStopped) {
            console.log("Scheduler is stopped. can not start.");
            return;
        }
        this.isPaused = false;
        this.executeNextTask();
    }

    async executeNextTask() {
        if (this.isPaused || this.isStopped || this.currentTaskIndex >= this.tasks.length) {
            return;
        }

        const task = this.tasks[this.currentTaskIndex];
        setTimeout(async () => {
            try {
                await task.func();
                this.currentTaskIndex++;
                this.executeNextTask();
            } catch (error) {
                if (task.attempts < task.retryCount) {
                    task.attempts++;
                    console.log(`Task ${task.id} failed, retrying... (${task.attempts}/${task.retryCount})`);
                    this.executeNextTask(); // Retry the same task
                } else {
                    console.log(`Task ${task.id} failed after ${task.retryCount} retries.`);
                    this.currentTaskIndex++;
                    this.executeNextTask();
                }
            }
        }, task.delay);
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        if (this.isStopped) {
            throw new Error("Scheduler is stopped. can not resume.")
            return;
        }
        this.isPaused = false;
        this.executeNextTask();
    }

    stop() {
        this.isStopped = true;
        this.tasks = [];
        this.currentTaskIndex = 0;
    }
}





const scheduler = new TaskScheduler();

scheduler.addTask('task1', () => new Promise(resolve => {
    console.log('Executing task 1');
    setTimeout(resolve, 1000);
}), 500);

scheduler.addTask('task2', () => {
    console.log('Executing task 2');
    return Promise.reject(new Error('Failed task 2'));
}, 500, 2); // This task will retry twice if it fails

scheduler.addTask('task3', () => new Promise(resolve => {
    console.log('Executing task 3');
    setTimeout(resolve, 1000);
}), 500);

scheduler.start(); // Start executing tasks

setTimeout(() => {
    scheduler.pause(); // Pause after some time
    console.log('Scheduler paused');
}, 600);

setTimeout(() => {
    scheduler.resume(); // Resume after some more time
    console.log('Scheduler resumed');
}, 6000);

setTimeout(() => {
    scheduler.stop();
    console.log('Scheduler stopped');
}, 1000);