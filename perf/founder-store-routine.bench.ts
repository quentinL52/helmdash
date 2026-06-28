import { performance } from 'perf_hooks';

interface Task {
    id: string;
    done: boolean;
}

interface RoutineDay {
    id: string;
    tasks: Task[];
}

// Generate some dummy data
const generateRoutine = (daysCount: number, tasksPerDay: number): RoutineDay[] => {
    const routine: RoutineDay[] = [];
    for (let i = 0; i < daysCount; i++) {
        const tasks: Task[] = [];
        for (let j = 0; j < tasksPerDay; j++) {
            tasks.push({
                id: `task-${i}-${j}`,
                done: Math.random() > 0.5
            });
        }
        routine.push({
            id: `day-${i}`,
            tasks
        });
    }
    return routine;
};

const routine = generateRoutine(1000, 100);

const runBaseline = () => {
    const start = performance.now();
    let rate = 0;
    for (let i = 0; i < 1000; i++) {
        const totalTasks = routine.reduce((acc, day) => acc + day.tasks.length, 0);
        const completedTasks = routine.reduce((acc, day) => acc + day.tasks.filter(t => t.done).length, 0);
        rate = totalTasks > 0 ? completedTasks / totalTasks : 0;
    }
    const end = performance.now();
    return end - start;
};

const runOptimized = () => {
    const start = performance.now();
    let rate = 0;
    for (let i = 0; i < 1000; i++) {
        let totalTasks = 0;
        let completedTasks = 0;
        for (const day of routine) {
            totalTasks += day.tasks.length;
            for (const task of day.tasks) {
                if (task.done) completedTasks++;
            }
        }
        rate = totalTasks > 0 ? completedTasks / totalTasks : 0;
    }
    const end = performance.now();
    return end - start;
};

// Warmup
runBaseline();
runOptimized();

const baselineTime = runBaseline();
const optimizedTime = runOptimized();

console.log(`Baseline time: ${baselineTime.toFixed(2)}ms`);
console.log(`Optimized time: ${optimizedTime.toFixed(2)}ms`);
console.log(`Improvement: ${((baselineTime - optimizedTime) / baselineTime * 100).toFixed(2)}%`);
