// API Response Types
export interface TaskResponse {
    task_id: string;
    message: string;
}

export interface TaskStatusResponse {
    task_id: string;
    status: string;
    result?: any;
}

export interface ProgressRun {
    run_tag: string;
    current_phase: string;
    progress_percentage: number;
}

export interface ProgressData {
    in_progress?: ProgressRun[];
    completed?: ProgressRun[];
    started?: ProgressRun[];
    [key: string]: ProgressRun[] | undefined;
}

export interface ProgressResponse {
    status: string;
    data?: ProgressData;
    message?: string;
}

export interface Channel {
    Discovered_Channel_ID: string;
    Discovered_Channel_Name: string;
    Discovered_Channel_URL: string;
    Final_Tier: number;
    Final_Status: string;
    run_tag: string;
}

export interface DownloadResponse {
    status: string;
    total_channels?: number;
    channels?: Channel[];
    message?: string;
}
