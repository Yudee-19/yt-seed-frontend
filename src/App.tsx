import { useState, useEffect } from "react";
import { pipelineAPI } from "./services/api";
import type { ProgressResponse, DownloadResponse, Channel } from "./types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
    Download,
    Play,
    FileSpreadsheet,
    Activity,
    CheckCircle2,
    Clock,
    XCircle,
    AlertCircle,
    Pause,
} from "lucide-react";

function App() {
    const [sheetUrl, setSheetUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [_taskId, setTaskId] = useState<string | null>(null);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<
        "success" | "error" | "info"
    >("info");
    const [progress, setProgress] = useState<ProgressResponse | null>(null);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [downloadLoading, setDownloadLoading] = useState(false);
    const [inputFormat, setInputFormat] = useState("Podcast");
    const [clientIntent, setClientIntent] = useState("");

    // Poll for progress updates and channels on different intervals
    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const data = await pipelineAPI.getProgress();
                setProgress(data);
            } catch (error) {
                console.error("Error fetching progress:", error);
            }
        };

        const fetchChannels = async () => {
            try {
                const response: DownloadResponse =
                    await pipelineAPI.downloadTier1And2();
                if (response.status === "success" && response.channels) {
                    setChannels(response.channels);
                }
            } catch (error) {
                console.error("Error fetching channels:", error);
            }
        };

        // Initial fetch
        fetchProgress();
        fetchChannels();

        // Set up intervals - progress every 10 seconds, channels every 15 seconds
        const progressInterval = setInterval(fetchProgress, 10000);
        const channelsInterval = setInterval(fetchChannels, 15000);

        return () => {
            clearInterval(progressInterval);
            clearInterval(channelsInterval);
        };
    }, []);

    const handleStartPipeline = async () => {
        if (!sheetUrl.trim()) {
            setMessage("Please enter a valid Google Sheets URL");
            setMessageType("error");
            return;
        }
        if (!clientIntent.trim()) {
            setMessage("Please enter a client intent");
            setMessageType("error");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const response = await pipelineAPI.startPipeline(
                sheetUrl,
                inputFormat,
                clientIntent
            );
            setTaskId(response.task_id);
            setMessage(`${response.message} (Task ID: ${response.task_id})`);
            setMessageType("success");
            setSheetUrl("");
            setClientIntent("");
        } catch (error: any) {
            setMessage(error.response?.data?.detail || error.message);
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadChannels = async () => {
        setDownloadLoading(true);
        setMessage("");

        try {
            const response: DownloadResponse =
                await pipelineAPI.downloadTier1And2();

            if (response.status === "success" && response.channels) {
                setChannels(response.channels);
                setMessage(`Downloaded ${response.total_channels} channels`);
                setMessageType("success");
            } else if (response.status === "empty") {
                setMessage(response.message || "No channels found");
                setMessageType("info");
                setChannels([]);
            }
        } catch (error: any) {
            setMessage(error.response?.data?.detail || error.message);
            setMessageType("error");
        } finally {
            setDownloadLoading(false);
        }
    };

    const handleExportToCSV = () => {
        if (channels.length === 0) return;

        const headers = [
            "Tier",
            "Channel Name",
            "Channel URL",
            "Status",
            "Run Tag",
        ];
        const rows = channels.map((ch) => [
            ch.Final_Tier,
            ch.Discovered_Channel_Name,
            ch.Discovered_Channel_URL,
            ch.Final_Status,
            ch.run_tag,
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `tier1_tier2_channels_${
            new Date().toISOString().split("T")[0]
        }.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "completed":
                return <CheckCircle2 className="h-4 w-4" />;
            case "started":
                return <Clock className="h-4 w-4" />;
            case "failed":
                return <XCircle className="h-4 w-4" />;
            case "paused_due_to_quota":
                return <Pause className="h-4 w-4" />;
            default:
                return <AlertCircle className="h-4 w-4" />;
        }
    };

    // const getStatusVariant = (
    //     status: string
    // ): "default" | "secondary" | "destructive" | "outline" => {
    //     switch (status) {
    //         case "completed":
    //             return "default";
    //         case "started":
    //             return "secondary";
    //         case "failed":
    //             return "destructive";
    //         default:
    //             return "outline";
    //     }
    // };

    return (
        <div className="min-h-screen w-full relative">
            {/* Azure Depths */}
            <div
                className="absolute inset-0 -z-10"
                style={{
                    background:
                        "radial-gradient(125% 125% at 50% 100%, #000000 20%, #7e22ce50 100%)",
                }}
            />
            {/* Your Content/Components */}

            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <Card className="mb-8 border-none shadow-xl bg-[#1A2332] text-white/80">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                            <Activity className="h-8 w-8 text-primary" />
                            <div>
                                <CardTitle className="text-4xl font-bold">
                                    YouTube Seed AI Pipeline
                                </CardTitle>
                                <CardDescription className=" text-white/80 text-xl mt-1">
                                    YouTube Channel Discovery & Analysis
                                    Platform
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                <div className="space-y-6">
                    {/* Start Pipeline Section */}
                    <Card className="shadow-lg bg-[#1A2332] border-none">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-primary">
                                <Play className="h-5 w-5" />
                                Start New Pipeline
                            </CardTitle>
                            <CardDescription>
                                Enter a Google Sheets URL to start processing
                                YouTube channels
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col gap-3">
                                <Input
                                    placeholder="https://docs.google.com/spreadsheets/d/..."
                                    value={sheetUrl}
                                    onChange={(e) =>
                                        setSheetUrl(e.target.value)
                                    }
                                    disabled={loading}
                                    className="flex-1"
                                    onKeyDown={(e) =>
                                        e.key === "Enter" &&
                                        handleStartPipeline()
                                    }
                                />
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <label className="block text-sm mb-1 text-white/80">
                                            Input Format
                                        </label>
                                        <select
                                            value={inputFormat}
                                            onChange={(e) =>
                                                setInputFormat(e.target.value)
                                            }
                                            disabled={loading}
                                            className="w-full px-3 py-2 rounded bg-[#232b3e] text-white border border-gray-700"
                                        >
                                            <option value="Podcast">
                                                Podcast
                                            </option>
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm mb-1 text-white/80">
                                            Client Intent
                                        </label>
                                        <Input
                                            placeholder="Podcast Growth"
                                            value={clientIntent}
                                            onChange={(e) =>
                                                setClientIntent(e.target.value)
                                            }
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                                <Button
                                    onClick={handleStartPipeline}
                                    disabled={loading}
                                    size="lg"
                                    className="px-8"
                                >
                                    {loading ? (
                                        <>
                                            <Clock className="mr-2 h-4 w-4 animate-spin" />
                                            Starting...
                                        </>
                                    ) : (
                                        <>
                                            <Play className="mr-2 h-4 w-4" />
                                            Start Pipeline
                                        </>
                                    )}
                                </Button>
                            </div>
                            {message && (
                                <Alert
                                    variant={
                                        messageType === "error"
                                            ? "destructive"
                                            : "default"
                                    }
                                >
                                    <AlertDescription>
                                        {message}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {/* Progress Section */}
                    <Card className="shadow-lg bg-[#1A2332] border-none">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <Activity className="h-5 w-5" />
                                Pipeline Progress
                            </CardTitle>
                            <CardDescription>
                                Monitor the status of all pipeline runs
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {progress?.status === "success" && progress.data ? (
                                <div className="space-y-6">
                                    {Object.entries(progress.data).map(
                                        ([status, runs]) => (
                                            <div
                                                key={status}
                                                className="space-y-3"
                                            >
                                                <div className="flex items-center gap-2 text-white">
                                                    {getStatusIcon(status)}
                                                    <h3 className="text-sm font-semibold capitalize">
                                                        {status.replace(
                                                            /_/g,
                                                            " "
                                                        )}
                                                    </h3>
                                                </div>
                                                <div className="flex flex-col gap-2 ml-6">
                                                    {(runs ?? []).map(
                                                        (run, idx) => (
                                                            <div
                                                                key={
                                                                    run.run_tag +
                                                                    idx
                                                                }
                                                                className="flex items-center gap-4"
                                                            >
                                                                <Badge
                                                                    // variant="primary"
                                                                    className="px-2 py-1"
                                                                >
                                                                    {
                                                                        run.run_tag
                                                                    }
                                                                </Badge>
                                                                <span className="text-xs text-white">
                                                                    {run.current_phase.replace(
                                                                        /_/g,
                                                                        " "
                                                                    )}
                                                                </span>
                                                                <div className="flex items-center text-white gap-1">
                                                                    <span className="text-xs">
                                                                        {
                                                                            run.progress_percentage
                                                                        }
                                                                        %
                                                                    </span>
                                                                    <div className="w-24 h-2 bg-gray-700 rounded">
                                                                        <div
                                                                            className="h-2 bg-primary rounded"
                                                                            style={{
                                                                                width: `${run.progress_percentage}%`,
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                                <Separator />
                                            </div>
                                        )
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No progress data available yet.</p>
                                    <p className="text-sm mt-2">
                                        Start a pipeline to see progress
                                        updates.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Download Section */}
                    <Card className="shadow-lg bg-[#1A2332] border-none text-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Download className="h-5 w-5" />
                                Download Results
                            </CardTitle>
                            <CardDescription>
                                Download all Tier 1 and Tier 2 channels from
                                completed runs
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                onClick={handleDownloadChannels}
                                disabled={downloadLoading}
                                size="lg"
                                variant="default"
                                className="w-full sm:w-auto"
                            >
                                {downloadLoading ? (
                                    <>
                                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <Download className="mr-2 h-4 w-4" />
                                        Download Tier 1 & 2 Channels
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Results Table */}
                    {channels.length > 0 && (
                        <Card className="shadow-lg">
                            <CardHeader>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileSpreadsheet className="h-5 w-5" />
                                            Channel Results
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            {channels.length} channels
                                            discovered
                                        </CardDescription>
                                    </div>
                                    <Button
                                        onClick={handleExportToCSV}
                                        variant="outline"
                                        size="lg"
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        Export to CSV
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>
                                                    Channel Name
                                                </TableHead>
                                                <TableHead>URL</TableHead>

                                                <TableHead>Run Tag</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {channels.map((channel, index) => (
                                                <TableRow key={index}>
                                                    {/* <TableCell>
                                                        <Badge
                                                            variant={
                                                                channel.tier ===
                                                                1
                                                                    ? "default"
                                                                    : "secondary"
                                                            }
                                                        >
                                                            Tier {channel.tier}
                                                        </Badge>
                                                    </TableCell> */}
                                                    <TableCell className="font-medium">
                                                        {
                                                            channel.Discovered_Channel_Name
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        <a
                                                            href={
                                                                channel.Discovered_Channel_URL
                                                            }
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-primary hover:underline inline-flex items-center gap-1"
                                                        >
                                                            View Channel
                                                        </a>
                                                    </TableCell>

                                                    <TableCell className="text-muted-foreground">
                                                        {channel.run_tag}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
