/**
 * Server-side in-memory store for generation tasks.
 * Lives in module scope so it persists across API route calls within
 * the same Next.js server process.
 */

export type TaskStatus = "pending" | "processing" | "completed" | "failed";

export interface TaskEntry {
    status: TaskStatus;
    progress: number;
    glbBuffer?: Buffer;
    error?: string;
    createdAt: number;
}

// Implement global singleton pattern to survive hot-reloads in development
declare global {
    // eslint-disable-next-line no-var
    var __taskStore: Map<string, TaskEntry> | undefined;
}

const taskStore = globalThis.__taskStore ?? new Map<string, TaskEntry>();

if (process.env.NODE_ENV !== "production") {
    globalThis.__taskStore = taskStore;
}

export function createTask(taskId: string): void {
    taskStore.set(taskId, {
        status: "pending",
        progress: 0,
        createdAt: Date.now(),
    });
}

export function getTask(taskId: string): TaskEntry | undefined {
    return taskStore.get(taskId);
}

export function updateTask(taskId: string, update: Partial<TaskEntry>): void {
    const existing = taskStore.get(taskId);
    if (existing) {
        taskStore.set(taskId, { ...existing, ...update });
    }
}

export function setTaskGlb(taskId: string, buffer: Buffer): void {
    const existing = taskStore.get(taskId);
    if (existing) {
        taskStore.set(taskId, {
            ...existing,
            status: "completed",
            progress: 100,
            glbBuffer: buffer,
        });
    }
}

export function failTask(taskId: string, error: string): void {
    const existing = taskStore.get(taskId);
    if (existing) {
        taskStore.set(taskId, {
            ...existing,
            status: "failed",
            error,
        });
    }
}

// Prune tasks older than 1 hour to avoid unbounded memory growth
export function pruneOldTasks(): void {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    for (const [id, task] of taskStore.entries()) {
        if (task.createdAt < oneHourAgo) {
            taskStore.delete(id);
        }
    }
}
