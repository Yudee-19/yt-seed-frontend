import axios from "axios";
import type {
    TaskResponse,
    TaskStatusResponse,
    ProgressResponse,
    DownloadResponse,
    QueueStatusAllResponse,
} from "../types/api";

// Use relative path - Vercel will rewrite /api/* to your EC2 backend
const API_BASE_URL = "http://54.209.40.8:8000/";
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export const pipelineAPI = {
    /**
     * Start the pipeline with a Google Sheets URL, input format, and client intent
     */
    startPipeline: async (
        sheetUrl: string,
        inputFormat: string,
        clientIntent: string
    ): Promise<TaskResponse> => {
        const response = await api.post<TaskResponse>("/start_pipeline", null, {
            params: {
                sheet_url: sheetUrl,
                input_format: inputFormat,
                clients_intent: clientIntent,
            },
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
    downloadTier1And2: async (
        pipeline_id: string
    ): Promise<DownloadResponse> => {
        const response = await api.get<DownloadResponse>(
            `/download_run_results/${pipeline_id}`
        );
        return response.data;
    },

    /**
     * Get the status of all lanes in the dashboard
     */
    getQueueStatusAll: async (): Promise<QueueStatusAllResponse> => {
        const response = await api.get<QueueStatusAllResponse>(
            "/queue_status_all"
        );
        return response.data;
    },
};

export default api;
