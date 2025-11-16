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

export interface ProgressResponse {
    status: string;
    data?: {
        [key: string]: string[];
    };
    message?: string;
}

export interface Channel {
    tier: number;
    Discovered_Channel_Name: string;
    Discovered_Channel_URL: string;
    reason: string;
    Discovered_From_Run?: string;
    run_tag?: string;
}

export interface DownloadResponse {
    status: string;
    total_channels?: number;
    channels?: Channel[];
    message?: string;
}
