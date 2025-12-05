// API Response Types
export interface TaskResponse {
    task_id: string;
    pipeline_execution_id: string;
    queue: string;
    message: string;
}

export interface TaskStatusResponse {
    task_id: string;
    status: string;
    result?: any;
}

export interface ProgressRun {
    run_tag: string;
    status: string;
    pipeline_execution_id: string;
    current_phase: string;
    progress_percentage: number;
    updated_at: string;
}

export interface ProgressData {
    in_progress?: ProgressRun[];
    completed?: ProgressRun[];
    started?: ProgressRun[];
    [key: string]: ProgressRun[] | undefined;
}

export interface ProgressResponse {
    status: string;
    data?: ProgressRun[];
    // message?: string;
}

export interface Channel {
    Discovered_Channel_ID: string;
    Discovered_Channel_Name: string;
    Discovered_Channel_URL: string;
    Final_Tier: number;
    Final_Status: string;
    run_tag: string;
    Seed_Channel_Name: string;
}

export interface DownloadResponse {
    status: string;
    pipeline_id?: string;
    total_channels?: number;
    channels?: Channel[];
    message?: string;
}

export interface LaneStatusBase {
    status: string;
    message: string;
    pipeline_execution_id: string;
    timer_seconds: number;
    run_tag?: string;
    timer_display?: string;
    resumes_at?: string;
    current_phase?: string;
    progress_percentage?: number;
}

export interface DashboardStatus {
    Podcast: LaneStatusBase;
    Documentary: LaneStatusBase;
    "Talking Head": LaneStatusBase;
}

export interface QueueStatusAllResponse {
    status: string;
    dashboard: DashboardStatus;
}
