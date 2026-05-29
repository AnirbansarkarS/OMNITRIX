/**
 * Tripo3D API Service
 * Handles text-to-3D model generation using Tripo3D API
 */

export interface Tripo3DGenerationRequest {
  prompt: string;
  style?: "realistic" | "cartoon" | "anime" | "creative";
  negativePrompt?: string;
  seed?: number;
}

export interface Tripo3DGenerationResponse {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  model_url?: string;
  error?: string;
  created_at: string;
  completed_at?: string;
}

export interface Tripo3DTaskStatus {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress?: number;
  model_url?: string;
  error?: string;
}

class Tripo3DService {
  private baseUrl: string = "https://api.tripo3d.ai/v1";
  private pollInterval: number = 2000; // 2 seconds
  private maxRetries: number = 300; // 10 minutes max wait

  private getApiKey(): string {
    const key = process.env.TRIPO3D_API_KEY;
    if (!key) {
      throw new Error("TRIPO3D_API_KEY environment variable is not configured");
    }
    return key;
  }

  /**
   * Submit a text-to-3D generation request
   */
  async generateFromText(
    request: Tripo3DGenerationRequest
  ): Promise<string> {
    try {
      const apiKey = this.getApiKey();
      const response = await fetch(`${this.baseUrl}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          prompt: request.prompt,
          style: request.style || "realistic",
          negative_prompt: request.negativePrompt,
          seed: request.seed,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          `Tripo3D API error: ${error.message || response.statusText}`
        );
      }

      const data = await response.json();
      return data.id; // Return task ID
    } catch (error) {
      console.error("Error submitting text-to-3D request:", error);
      throw error;
    }
  }

  /**
   * Poll for generation status and retrieve model URL
   */
  async pollGenerationStatus(
    taskId: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    let retries = 0;

    while (retries < this.maxRetries) {
      try {
        const status = await this.getTaskStatus(taskId);

        if (onProgress) {
          onProgress(status.progress || 0);
        }

        if (status.status === "completed" && status.model_url) {
          return status.model_url;
        }

        if (status.status === "failed") {
          throw new Error(
            `Generation failed: ${status.error || "Unknown error"}`
          );
        }

        // Wait before polling again
        await new Promise((resolve) => setTimeout(resolve, this.pollInterval));
        retries++;
      } catch (error) {
        console.error("Error polling generation status:", error);
        throw error;
      }
    }

    throw new Error("Generation timeout: Task took too long to complete");
  }

  /**
   * Get the current status of a generation task
   */
  async getTaskStatus(taskId: string): Promise<Tripo3DTaskStatus> {
    try {
      const apiKey = this.getApiKey();
      const response = await fetch(`${this.baseUrl}/generate/${taskId}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch task status: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        id: data.id,
        status: data.status,
        progress: data.progress,
        model_url: data.model_url,
        error: data.error,
      };
    } catch (error) {
      console.error("Error fetching task status:", error);
      throw error;
    }
  }

  /**
   * Cancel an ongoing generation task
   */
  async cancelTask(taskId: string): Promise<void> {
    try {
      const apiKey = this.getApiKey();
      const response = await fetch(`${this.baseUrl}/generate/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel task: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error cancelling task:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const tripo3dService = new Tripo3DService();
