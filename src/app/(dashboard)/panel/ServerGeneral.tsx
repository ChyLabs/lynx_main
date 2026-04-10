import { useMemo, useState, useRef } from "react"
import { ServerTerminal, type ServerTerminalRef } from "@/components/app/ServerTerminal"
import { useParams } from "@tanstack/react-router"
import {
    Area,
    AreaChart,
    CartesianGrid,
    XAxis,
    YAxis,
} from "recharts"
import { useServer } from "@/db/queries/useServer"
import { useServerResources } from "@/hooks/useServerResources"
import type { ServerStatus } from "@/types/app.types"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import {
    Cpu,
    HardDrive,
    Loader2,
    MemoryStick,
    Power,
    PowerOff,
    RefreshCw,
    RotateCcw,
    Server,
    Terminal,
    Wifi,
    WifiOff,
    X,
} from "lucide-react"
import { toast } from "sonner";


const CHART_STROKE = "var(--chart-2)"

function shellHostLabel(name: string) {
    const s = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9.-]+/g, "-")
        .replace(/^-+|-+$/g, "")
    return s || "localhost"
}

const statusLabel: Record<ServerStatus, string> = {
    RUNNING: "Online",
    STOPPED: "Offline",
    INSTALLING: "Installing",
    SUSPENDED: "Suspended",
    ERROR: "Error",
}

const statusStyle: Record<
    ServerStatus,
    { dot: string; pill: string }
> = {
    RUNNING: {
        dot: "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.45)]",
        pill: "border-emerald-500/25 bg-emerald-500/10 text-emerald-200",
    },
    STOPPED: {
        dot: "bg-zinc-500",
        pill: "border-border bg-muted/60 text-muted-foreground",
    },
    INSTALLING: {
        dot: "bg-purple-400 animate-pulse",
        pill: "border-purple-500/30 bg-purple-500/10 text-purple-200",
    },
    SUSPENDED: {
        dot: "bg-amber-400",
        pill: "border-amber-500/25 bg-amber-500/10 text-amber-100",
    },
    ERROR: {
        dot: "bg-red-500",
        pill: "border-destructive/30 bg-destructive/10 text-destructive",
    },
}

const buildSeries = (
    points: number,
    base: number,
    variance: number,
    scale: number
) => {
    return Array.from({ length: points }, (_, i) => {
        const wobble =
            Math.sin(i * 0.45) * variance + Math.cos(i * 0.31) * variance * 0.35
        return {
            t: i,
            v: Math.max(0, Math.round((base + wobble) * scale) / scale),
        }
    })
}

// Checked
const ServerGeneral = () => {
    const params = useParams({ strict: false })
    const server_uuid = params.server_uuid as string | undefined

    const { getServerByUuid, startServerMutation, stopServerMutation, restartServerMutation } = useServer()
    const { data, isLoading, refetch } = getServerByUuid(server_uuid as string)

    const server = data?.data?.server

    const terminalRef = useRef<ServerTerminalRef>(null)
    const [terminalConnected, setTerminalConnected] = useState(false)

    const { metrics, history, status: wsStatus, reconnect } = useServerResources(
        server_uuid,
        server?.node?.domain
    )

    const memoryLimitMb = server?.memory ?? "0"
    const diskLimitMb = server?.disk ?? "-"

    const placeholderMemoryData = useMemo(() => {
        const limit = parseInt(server?.memory ?? "0")
        return buildSeries(24, limit * 0.85, limit * 0.08, 10)
    }, [server?.memory])

    const placeholderCpuData = useMemo(() => buildSeries(24, 5.5, 2.5, 100), [])

    const memoryChartData = history.memory.length > 0 ? history.memory : placeholderMemoryData
    const cpuChartData = history.cpu.length > 0 ? history.cpu : placeholderCpuData

    const memoryChartConfig = {
        v: {
            label: "Memory",
            color: CHART_STROKE,
        },
    }

    const cpuChartConfig = {
        v: {
            label: "CPU",
            color: CHART_STROKE,
        },
    }

    const memUsed = metrics.memoryMB
    const diskUsed = metrics.diskMB
    const cpuPct = metrics.cpuPercent

    const cpuLoadPct = Math.min(100, cpuPct)
    const memLoadPct = Math.min(100, (memUsed / parseInt(memoryLimitMb)) * 100)
    const diskLoadPct = Math.min(100, (diskUsed / parseInt(diskLimitMb)) * 100)

    if (isLoading || !data) {
        return (
            <div className="bg-background min-h-0 p-4 md:p-8">
                <div className="mx-auto w-full max-w-300 space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-48 rounded-md" />
                            <Skeleton className="h-4 w-72 rounded-md" />
                        </div>
                        <Skeleton className="h-10 w-full rounded-lg sm:w-64" />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                        <Skeleton className="h-28 rounded-2xl" />
                        <Skeleton className="h-28 rounded-2xl" />
                        <Skeleton className="h-28 rounded-2xl" />
                    </div>
                    <Skeleton className="min-h-72 rounded-2xl" />
                    <Skeleton className="h-72 rounded-2xl" />
                </div>
            </div>
        )
    }

    if (!server) {
        return (
            <div className="bg-background text-muted-foreground flex min-h-40 items-center justify-center p-6">
                Server not found or you no longer have access.
            </div>
        )
    }

    const shortId =
        server.uuid.length > 12
            ? `${server.uuid.slice(0, 6)}…${server.uuid.slice(-4)}`
            : server.uuid

    const shellHost = shellHostLabel(server.name)

    const onStart = () => {
        startServerMutation.mutate(
            { node_uuid: server.node.uuid!, server_uuid: server_uuid! },
            {
                onSuccess: (data) => {
                    console.log(data)
                    toast.success(data.message)
                    refetch()
                },
                onError: (err: any) => {
                    console.log(err)
                }
            }
        )
    }

    const onStop = () => {
        stopServerMutation.mutate(
            { node_uuid: server.node.uuid!, server_uuid: server_uuid! },
            {
                onSuccess: (data) => {
                    console.log(data)
                    toast.success(data.message)
                    refetch()
                },
                onError: (err: any) => {
                    console.log(err)
                }
            }
        )
    }

    const onRestart = () => {
        restartServerMutation.mutate(
            { node_uuid: server.node.uuid!, server_uuid: server_uuid! },
            {
                onSuccess: (data) => {
                    console.log(data)
                    toast.success(data.message)
                    refetch()
                },
                onError: (err: any) => {
                    console.log(err)
                }
            }
        )
    }

    const isTerminalBlocked =
        server.status === "STOPPED" ||
        server.status === "INSTALLING" ||
        restartServerMutation.isPending ||
        startServerMutation.isPending

    const terminalOverlayLabel =
        server.status === "INSTALLING"
            ? "Installing…"
            : restartServerMutation.isPending
                ? "Restarting…"
                : startServerMutation.isPending
                    ? "Starting…"
                    : "Server offline"

    const terminalOverlaySpinning =
        server.status === "INSTALLING" ||
        restartServerMutation.isPending ||
        startServerMutation.isPending

    return (
        <div className="bg-background min-h-0 p-4 md:p-8">
            <div className="mx-auto flex w-full max-w-300 flex-col gap-8">
                <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                            <span
                                className="bg-primary/10 text-primary ring-border/60 flex size-11 shrink-0 items-center justify-center rounded-2xl ring-1"
                                aria-hidden
                            >
                                <Server className="size-5" strokeWidth={1.75} />
                            </span>
                            <div className="min-w-0">
                                <h1 className="text-foreground truncate text-2xl font-semibold tracking-tight">
                                    {server.name}
                                </h1>
                                <p className="text-muted-foreground font-mono text-xs">
                                    {shortId}
                                </p>
                            </div>
                        </div>
                        <div
                            className={cn(
                                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
                                statusStyle[server.status].pill
                            )}
                        >
                            <span
                                className={cn(
                                    "size-1.5 shrink-0 rounded-full",
                                    statusStyle[server.status].dot
                                )}
                            />
                            {statusLabel[server.status]}
                        </div>
                    </div>

                    <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end lg:w-auto lg:min-w-[min(100%,20rem)]">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onStart}
                            className="justify-center gap-2 rounded-xl sm:flex-1 lg:flex-none"
                            disabled={server.status === "RUNNING" || startServerMutation.isPending || server.status === "INSTALLING"}
                        >
                            {startServerMutation.isPending ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Starting...
                                </>
                            ) : (
                                <>
                                    <Power className="size-4" />
                                    Start
                                </>
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onRestart}
                            className="justify-center gap-2 rounded-xl sm:flex-1 lg:flex-none"
                            disabled={server.status === "STOPPED" || restartServerMutation.isPending || server.status === "INSTALLING"}
                        >
                            {restartServerMutation.isPending ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Restarting...
                                </>
                            ) : (
                                <>
                                    <RotateCcw className="size-4" />
                                    Restart
                                </>
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={onStop}
                            className="justify-center gap-2 rounded-xl sm:flex-1 lg:flex-none"
                            disabled={server.status === "STOPPED" || stopServerMutation.isPending || server.status === "INSTALLING"}
                        >
                            {stopServerMutation.isPending ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Stopping...
                                </>
                            ) : (
                                <>
                                    <PowerOff className="size-4" />
                                    Stop
                                </>
                            )}
                        </Button>
                    </div>
                </header>

                <section
                    aria-label="Resource usage"
                    className="grid gap-3 sm:grid-cols-3"
                >
                    {[
                        {
                            key: "cpu",
                            label: "Processor",
                            value: `${cpuPct}%`,
                            hint: "of host allowance",
                            icon: Cpu,
                            load: cpuLoadPct,
                        },
                        {
                            key: "ram",
                            label: "Memory",
                            value: `${memUsed} / ${memoryLimitMb} MB`,
                            hint: "heap & cache",
                            icon: MemoryStick,
                            load: memLoadPct,
                        },
                        {
                            key: "disk",
                            label: "Storage",
                            value: `${diskUsed.toFixed(1)} / ${diskLimitMb} MB`,
                            hint: "persistent data",
                            icon: HardDrive,
                            load: diskLoadPct,
                        },
                    ].map(({ key, label, value, hint, icon: Icon, load }) => (
                        <div
                            key={key}
                            className="border-border/80 bg-muted/25 flex flex-col gap-3 rounded-2xl border p-4 shadow-xs"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                                    {label}
                                </span>
                                <Icon
                                    className="text-muted-foreground/80 size-4 shrink-0"
                                    strokeWidth={1.75}
                                />
                            </div>
                            <p className="text-foreground text-xl font-semibold tabular-nums tracking-tight">
                                {value}
                            </p>
                            <Progress value={load} className="h-1.5 bg-muted/80" />
                            <p className="text-muted-foreground text-[11px] leading-tight">
                                {hint}
                            </p>
                        </div>
                    ))}
                </section>

                <section
                    aria-label="Terminal"
                    className="space-y-2"
                    aria-busy={isTerminalBlocked}
                >
                    <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium tracking-wide uppercase">
                        <Terminal className="size-3.5" />
                        Terminal
                    </div>
                    <div className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm">
                        <div className="border-border bg-muted/40 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
                            <span className="text-muted-foreground text-xs font-medium">
                                Session
                            </span>
                            <div className="flex items-center gap-2">
                                <div
                                    className={cn(
                                        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
                                        statusStyle[server.status].pill
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "size-1.5 shrink-0 rounded-full",
                                            statusStyle[server.status].dot
                                        )}
                                    />
                                    {statusLabel[server.status]}
                                </div>
                                {terminalConnected && (
                                    <Button
                                        onClick={() => terminalRef.current?.disconnect()}
                                        variant="destructive"
                                        size="sm"
                                        className="gap-1.5 h-7"
                                    >
                                        <X className="size-3.5" />
                                        Disconnect
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="relative">
                            <div
                                className={cn(
                                    isTerminalBlocked &&
                                    "pointer-events-none blur-[1.5px] transition-[filter]"
                                )}
                            >
                                <ServerTerminal
                                    ref={terminalRef}
                                    hostLabel={shellHost}
                                    server_uuid={server_uuid!}
                                    nodeDomain={server?.node?.domain}
                                    onConnectionStateChange={(state) => setTerminalConnected(state === "connected")}
                                />
                            </div>
                            {isTerminalBlocked && (
                                <div className="bg-background/50 absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 px-4 backdrop-blur-[2px]">
                                    {terminalOverlaySpinning ? (
                                        <Loader2
                                            className="text-muted-foreground size-8 animate-spin"
                                            aria-hidden
                                        />
                                    ) : null}
                                    <p className="text-muted-foreground text-center text-sm font-medium">
                                        {terminalOverlayLabel}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section aria-label="Telemetry" className="space-y-2">
                    <div className="text-muted-foreground flex items-center justify-between gap-2 text-xs font-medium tracking-wide uppercase">
                        <span>Live telemetry</span>
                        <div className="flex items-center gap-2">
                            {wsStatus === 'connected' && (
                                <span className="flex items-center gap-1.5 text-emerald-600">
                                    <Wifi className="size-3" />
                                    <span className="normal-case">Connected</span>
                                </span>
                            )}
                            {wsStatus === 'connecting' && (
                                <span className="flex items-center gap-1.5 text-amber-600">
                                    <Loader2 className="size-3 animate-spin" />
                                    <span className="normal-case">Connecting</span>
                                </span>
                            )}
                            {wsStatus === 'disconnected' && (
                                <Button
                                    onClick={reconnect}
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 gap-1.5 px-2 text-xs"
                                >
                                    <WifiOff className="size-3" />
                                    <span>Reconnect</span>
                                </Button>
                            )}
                            {wsStatus === 'error' && (
                                <Button
                                    onClick={reconnect}
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 gap-1.5 px-2 text-xs text-destructive"
                                >
                                    <RefreshCw className="size-3" />
                                    <span>Retry</span>
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className="border-border/80 bg-card/60 overflow-hidden rounded-2xl border shadow-sm">
                        <div className="border-border/60 bg-muted/20 px-5 py-3.5">
                            <p className="text-foreground text-sm font-medium">
                                Resource history
                            </p>
                            <p className="text-muted-foreground text-xs">
                                {history.memory.length > 0 || history.cpu.length > 0
                                    ? 'Live data updating every second'
                                    : 'Waiting for live feed connection...'}
                            </p>
                        </div>
                        <div className="divide-border/60 grid divide-y lg:grid-cols-2 lg:divide-x lg:divide-y-0">
                            <div className="p-4 sm:p-5">
                                <p className="text-muted-foreground mb-3 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
                                    <MemoryStick className="text-chart-2 size-3.5" />
                                    Memory
                                </p>
                                <ChartContainer
                                    config={memoryChartConfig}
                                    className="aspect-auto h-50 w-full [&_.recharts-surface]:overflow-visible"
                                >
                                    <AreaChart
                                        data={memoryChartData}
                                        margin={{
                                            left: 4,
                                            right: 4,
                                            top: 4,
                                            bottom: 0,
                                        }}

                                    >
                                        <defs>
                                            <linearGradient
                                                id="fillMemoryLynx"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="0%"
                                                    stopColor={CHART_STROKE}
                                                    stopOpacity={0.28}
                                                />
                                                <stop
                                                    offset="100%"
                                                    stopColor={CHART_STROKE}
                                                    stopOpacity={0}
                                                />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid
                                            vertical={false}
                                            strokeDasharray="3 3"
                                            className="stroke-border/50"
                                        />
                                        <XAxis
                                            dataKey="t"
                                            tickLine={false}
                                            axisLine={false}
                                            tick={false}
                                        />
                                        <YAxis
                                            width={44}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(v) => `${v}`}
                                            domain={[
                                                0,
                                                Math.max(parseInt(memoryLimitMb), 100),
                                            ]}
                                            tick={{
                                                fill: "var(--muted-foreground)",
                                                fontSize: 10,
                                            }}
                                        />
                                        <ChartTooltip
                                            cursor={{
                                                stroke: "var(--border)",
                                                strokeWidth: 1,
                                            }}
                                            content={
                                                <ChartTooltipContent
                                                    formatter={(value) => (
                                                        <span className="tabular-nums">
                                                            {Number(value).toFixed(0)}{" "}
                                                            MB
                                                        </span>
                                                    )}
                                                />
                                            }
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="v"
                                            stroke={CHART_STROKE}
                                            strokeWidth={2}
                                            fill="url(#fillMemoryLynx)"
                                            fillOpacity={1}
                                            isAnimationActive={false}
                                        />
                                    </AreaChart>
                                </ChartContainer>
                            </div>
                            <div className="p-4 sm:p-5">
                                <p className="text-muted-foreground mb-3 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
                                    <Cpu className="text-chart-2 size-3.5" />
                                    CPU
                                </p>
                                <ChartContainer
                                    config={cpuChartConfig}
                                    className="aspect-auto h-50 w-full [&_.recharts-surface]:overflow-visible"
                                >
                                    <AreaChart
                                        data={cpuChartData}
                                        margin={{
                                            left: 4,
                                            right: 4,
                                            top: 4,
                                            bottom: 0,
                                        }}
                                    >
                                        <defs>
                                            <linearGradient
                                                id="fillCpuLynx"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="0%"
                                                    stopColor={CHART_STROKE}
                                                    stopOpacity={0.28}
                                                />
                                                <stop
                                                    offset="100%"
                                                    stopColor={CHART_STROKE}
                                                    stopOpacity={0}
                                                />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid
                                            vertical={false}
                                            strokeDasharray="3 3"
                                            className="stroke-border/50"
                                        />
                                        <XAxis
                                            dataKey="t"
                                            tickLine={false}
                                            axisLine={false}
                                            tick={false}
                                        />
                                        <YAxis
                                            width={40}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(v) => `${v}%`}
                                            domain={[0, history.cpu.length > 0 ? 'auto' : 10]}
                                            tick={{
                                                fill: "var(--muted-foreground)",
                                                fontSize: 10,
                                            }}
                                        />
                                        <ChartTooltip
                                            cursor={{
                                                stroke: "var(--border)",
                                                strokeWidth: 1,
                                            }}
                                            content={
                                                <ChartTooltipContent
                                                    formatter={(value) => (
                                                        <span className="tabular-nums">
                                                            {Number(value).toFixed(
                                                                2
                                                            )}
                                                            %
                                                        </span>
                                                    )}
                                                />
                                            }
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="v"
                                            stroke={CHART_STROKE}
                                            strokeWidth={2}
                                            fill="url(#fillCpuLynx)"
                                            fillOpacity={1}
                                            isAnimationActive={false}
                                        />
                                    </AreaChart>
                                </ChartContainer>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default ServerGeneral
