"use client";

import { create } from "zustand";

interface SceneStats {
    polys: number;
    verts: number;
    materials: number;
}

interface ModelState {
    file: File | null;
    modelUrl: string | null;
    modelExt: string | null;
    sceneStats: SceneStats | null;
    setFile: (file: File) => void;
    setModelUrl: (url: string, ext: string) => void;
    setSceneStats: (stats: SceneStats) => void;
    clearModel: () => void;
}

export const useModelStore = create<ModelState>((set, get) => ({
    file: null,
    modelUrl: null,
    modelExt: null,
    sceneStats: null,

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
}));
