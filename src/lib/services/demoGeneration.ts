/**
 * Demo Generation Service
 * Simulates Tripo3D API responses for testing
 * Uses timestamp-based progress calculation instead of setTimeout
 */

export interface DemoTaskStatus {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  model_url?: string;
  error?: string;
}

interface DemoTask extends DemoTaskStatus {
  createdAt: number;
}

// In-memory storage for demo tasks
const demoTasks = new Map<string, DemoTask>();

export const demoGenerationService = {
  /**
   * Create a demo generation task
   * Progress timeline (in milliseconds):
   * 0ms: Created (pending, 0%)
   * 1000ms: Processing (15%)
   * 3000ms: Processing (45%)
   * 6000ms: Processing (75%)
   * 10000ms: Completed (100%, with model URL)
   */
  createDemoTask(): string {
    const taskId = `demo_task_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    demoTasks.set(taskId, {
      id: taskId,
      status: "pending",
      progress: 0,
      createdAt: Date.now(),
    });

    return taskId;
  },

  /**
   * Get demo task status based on elapsed time
   */
  getDemoTaskStatus(taskId: string): DemoTaskStatus {
    const task = demoTasks.get(taskId);

    if (!task) {
      return {
        id: taskId,
        status: "failed",
        progress: 0,
        error: "Task not found",
      };
    }

    const elapsed = Date.now() - task.createdAt;
    const totalTime = 10000; // 10 seconds total

    // Calculate progress based on time
    let progress = 0;
    let status: "pending" | "processing" | "completed" = "pending";

    if (elapsed < 1000) {
      // 0-1s: pending
      progress = 0;
      status = "pending";
    } else if (elapsed < 3000) {
      // 1-3s: 15% -> 45%
      progress = 15 + ((elapsed - 1000) / 2000) * 30;
      status = "processing";
    } else if (elapsed < 6000) {
      // 3-6s: 45% -> 75%
      progress = 45 + ((elapsed - 3000) / 3000) * 30;
      status = "processing";
    } else if (elapsed < totalTime) {
      // 6-10s: 75% -> 100%
      progress = 75 + ((elapsed - 6000) / 4000) * 25;
      status = "processing";
    } else {
      // Complete
      progress = 100;
      status = "completed";
    }

    // Return status
    if (status === "completed") {
      return {
        id: task.id,
        status: "completed",
        progress: 100,
        model_url:
          "https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.glb",
      };
    }

    return {
      id: task.id,
      status,
      progress: Math.round(progress),
    };
  },

  /**
   * Clear all demo tasks
   */
  clearDemoTasks(): void {
    demoTasks.clear();
  },
};
