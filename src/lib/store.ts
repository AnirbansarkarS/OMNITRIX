"use client";

import { create } from "zustand";

interface SceneStats {
    polys: number;
    verts: number;
    materials: number;
}

interface GenerationTask {
    id: string;
    prompt: string;
    status: "pending" | "processing" | "completed" | "failed";
    progress: number;
    modelUrl?: string;
    error?: string;
    createdAt: string;
}

interface ModelState {
    file: File | null;
    modelUrl: string | null;
    modelExt: string | null;
    sceneStats: SceneStats | null;
    
    // Text-to-3D generation
    generationTask: GenerationTask | null;
    generationHistory: GenerationTask[];
    
    setFile: (file: File) => void;
    setModelUrl: (url: string, ext: string) => void;
    setSceneStats: (stats: SceneStats) => void;
    clearModel: () => void;
    
    // Generation methods
    setGenerationTask: (task: GenerationTask) => void;
    updateGenerationProgress: (taskId: string, progress: number) => void;
    completeGeneration: (taskId: string, modelUrl: string) => void;
    failGeneration: (taskId: string, error: string) => void;
    addToHistory: (task: GenerationTask) => void;
    clearGenerationTask: () => void;
}

export const useModelStore = create<ModelState>((set, get) => ({
    file: null,
    modelUrl: null,
    modelExt: null,
    sceneStats: null,
    generationTask: null,
    generationHistory: [],

    setFile: (file: File) => {
        const prev = get().modelUrl;
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        const url = URL.createObjectURL(file);
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "glb";
        set({ file, modelUrl: url, modelExt: ext, sceneStats: null });
    },

    setModelUrl: (url: string, ext: string) => {
        const prev = get().modelUrl;
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        set({ modelUrl: url, modelExt: ext, file: null, sceneStats: null });
    },

    setSceneStats: (stats: SceneStats) => set({ sceneStats: stats }),

    clearModel: () => {
        const prev = get().modelUrl;
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        set({ file: null, modelUrl: null, modelExt: null, sceneStats: null });
    },

    // Generation task methods
    setGenerationTask: (task: GenerationTask) => {
        set({ generationTask: task });
    },

    updateGenerationProgress: (taskId: string, progress: number) => {
        const current = get().generationTask;
        if (current && current.id === taskId) {
            set({
                generationTask: {
                    ...current,
                    progress: Math.min(progress, 100),
                    status: progress >= 100 ? "completed" : "processing",
                },
            });
        }
    },

    completeGeneration: (taskId: string, modelUrl: string) => {
        const current = get().generationTask;
        if (current && current.id === taskId) {
            const completed = {
                ...current,
                status: "completed" as const,
                progress: 100,
                modelUrl,
            };
            set({
                generationTask: completed,
                generationHistory: [completed, ...get().generationHistory].slice(0, 10),
            });
            // Auto-load the generated model
            get().setModelUrl(modelUrl, "glb");
        }
    },

    failGeneration: (taskId: string, error: string) => {
        const current = get().generationTask;
        if (current && current.id === taskId) {
            const failed = {
                ...current,
                status: "failed" as const,
                error,
            };
            set({
                generationTask: failed,
                generationHistory: [failed, ...get().generationHistory].slice(0, 10),
            });
        }
    },

    addToHistory: (task: GenerationTask) => {
        set({
            generationHistory: [task, ...get().generationHistory].slice(0, 10),
        });
    },

    clearGenerationTask: () => {
        set({ generationTask: null });
    },
}));
