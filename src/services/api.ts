import axios from "axios";
import type {
    TaskResponse,
    TaskStatusResponse,
    ProgressResponse,
    DownloadResponse,
} from "../types/api";

// In frontend/src/services/api.ts
const API_BASE_URL = "http://52.86.241.28:8000";
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export const pipelineAPI = {
    /**
     * Start the pipeline with a Google Sheets URL
     */
    startPipeline: async (sheetUrl: string): Promise<TaskResponse> => {
        const response = await api.post<TaskResponse>("/start_pipeline", null, {
            params: { sheet_url: sheetUrl },
        });
        return response.data;
    },

    /**
     * Get the status of a specific task by task_id
     */
    getTaskStatus: async (taskId: string): Promise<TaskStatusResponse> => {
        const response = await api.get<TaskStatusResponse>(`/status/${taskId}`);
        return response.data;
    },

    /**
     * Get the progress of all pipeline runs
     */
    getProgress: async (): Promise<ProgressResponse> => {
        const response = await api.get<ProgressResponse>("/progress");
        return response.data;
    },

    /**
     * Download all Tier 1 and Tier 2 channels from completed runs
     */
    downloadTier1And2: async (): Promise<DownloadResponse> => {
        const response = await api.get<DownloadResponse>("/download_tier1_2");
        return response.data;
    },
};

export default api;
