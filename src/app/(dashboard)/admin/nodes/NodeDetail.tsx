import { Link, useParams } from "@tanstack/react-router"
import { ArrowLeft, Cpu, HardDrive, Key, Loader2, MemoryStick, Network, Pencil, RefreshCw, Wifi, WifiOff } from "lucide-react"
import { useMemo } from "react"
import {
    Area,
    AreaChart,
    CartesianGrid,
    XAxis,
    YAxis,
} from "recharts"

import { useNode } from "@/db/queries/useNode"
import { useNodeResources } from "@/hooks/useNodeResources"
import type { NodeRecord } from "@/validators/node.validator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

const CHART_STROKE = "var(--chart-2)"

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

const formatMegabytes = (mb: number): string => {
    if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`
    return `${mb} MB`
}

const formatDate = (iso: string): string => {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    return d.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    })
}

type DetailRowProps = {
    label: string
    value: string | number | null | undefined
    mono?: boolean
}

const DetailRow = ({ label, value, mono = false }: DetailRowProps) => (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between">
        <span className="text-muted-foreground text-sm">{label}</span>
        <span
            className={`text-foreground text-sm font-medium ${mono ? "font-mono" : ""}`}
        >
            {value ?? <span className="text-muted-foreground font-normal">—</span>}
        </span>
    </div>
)

const NodeDetailSkeletons = () => (
    <div className="space-y-4">
        <div className="space-y-2">
            <Skeleton className="h-8 w-48 rounded-md md:h-9" />
            <Skeleton className="h-4 w-64 rounded-md" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="shadow-sm">
                    <CardHeader className="pb-3">
                        <Skeleton className="h-4 w-20 rounded" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {Array.from({ length: 3 }).map((_, j) => (
                            <div key={j} className="flex justify-between">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-28" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
)

type NodeDetailContentProps = {
    node: NodeRecord
}

const NodeDetailContent = ({ node }: NodeDetailContentProps) => (
    <>
        <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
                <h1 className="text-foreground text-xl font-semibold tracking-tight md:text-2xl">
                    {node.name}
                </h1>
                {node.description && (
                    <p className="text-muted-foreground mt-1 text-sm">
                        {node.description}
                    </p>
                )}
            </div>

            <div className="flex flex-wrap gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="touch-manipulation cursor-pointer"
                    asChild
                >
                    <Link
                        to="/admin/nodes/$node_uuid/allocations"
                        params={{ node_uuid: node.uuid }}
                    >
                        <Network className="size-3.5" aria-hidden />
                        Allocations
                    </Link>
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="touch-manipulation cursor-pointer"
                    asChild
                >
                    <Link
                        to="/admin/nodes/$node_uuid/api-keys"
                        params={{ node_uuid: node.uuid }}

                    >
                        <Key className="size-3.5" aria-hidden />
                        API keys
                    </Link>
                </Button>
                <Button
                    size="sm"
                    className="touch-manipulation cursor-pointer"
                    asChild
                >
                    <Link
                        to="/admin/nodes/$node_uuid/edit"
                        params={{ node_uuid: node.uuid }}
                    >
                        <Pencil className="size-3.5" aria-hidden />
                        Edit
                    </Link>
                </Button>
            </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">General</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <DetailRow label="Location" value={node.location} />
                    <Separator />
                    <DetailRow label="Location code" value={node.location_code} mono />
                    <Separator />
                    <DetailRow
                        label="Created"
                        value={formatDate(node.created_at)}
                    />
                    <Separator />
                    <DetailRow
                        label="Updated"
                        value={formatDate(node.updated_at)}
                    />
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Connection</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <DetailRow label="Host" value={node.host} mono />
                    <Separator />
                    <DetailRow label="Port" value={node.port} mono />
                    <Separator />
                    <DetailRow
                        label="Domain"
                        value={node.domain ?? undefined}
                        mono
                    />
                </CardContent>
            </Card>

            <Card className="shadow-sm md:col-span-2">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Resources</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1">
                        <p className="text-muted-foreground text-xs">CPU</p>
                        <p className="text-foreground text-lg font-semibold tabular-nums">
                            {node.cpu}{" "}
                            <span className="text-muted-foreground text-xs font-normal">
                                cores
                            </span>
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-muted-foreground text-xs">Memory</p>
                        <p className="text-foreground text-lg font-semibold tabular-nums">
                            {formatMegabytes(node.memory)}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-muted-foreground text-xs">Disk</p>
                        <p className="text-foreground text-lg font-semibold tabular-nums">
                            {formatMegabytes(node.disk)}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>


    </>
)

// Checked
const NodeDetail = () => {
    const params = useParams({ strict: false })
    const node_uuid = params.node_uuid as string | undefined

    const { getNodeByUuid } = useNode()
    const { data, isLoading, isError, error } = getNodeByUuid(node_uuid ?? "")
    const node = data?.data?.node as NodeRecord | undefined

    const { metrics, history, status: wsStatus, reconnect } = useNodeResources(
        node_uuid,
        node?.domain || undefined
    )

    const placeholderMemoryData = useMemo(() => {
        const totalMB = node?.memory ?? 0
        return buildSeries(24, totalMB * 0.65, totalMB * 0.1, 10)
    }, [node?.memory])

    const placeholderCpuData = useMemo(() => buildSeries(24, 15, 5, 100), [])
    const placeholderDiskData = useMemo(() => {
        const totalGB = node?.disk ? node.disk / 1024 : 100
        return buildSeries(24, totalGB * 0.4, totalGB * 0.08, 100)
    }, [node?.disk])

    const memoryChartData = history.memory.length > 0 ? history.memory : placeholderMemoryData
    const cpuChartData = history.cpu.length > 0 ? history.cpu : placeholderCpuData
    const diskChartData = history.disk.length > 0 ? history.disk : placeholderDiskData

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

    const diskChartConfig = {
        v: {
            label: "Disk",
            color: CHART_STROKE,
        },
    }

    const memoryUsedMB = metrics.memoryUsedMB
    const memoryTotalMB = metrics.memoryTotalMB || node?.memory || 0
    const diskUsedGB = metrics.diskUsedGB
    const diskTotalGB = metrics.diskTotalGB || (node?.disk ? node.disk / 1024 : 0)
    const cpuPercent = metrics.cpuPercent

    const cpuLoadPct = Math.min(100, cpuPercent)
    const memLoadPct = metrics.memoryPercent
    const diskLoadPct = metrics.diskPercent

    if (!node_uuid) {
        return (
            <p className="text-muted-foreground text-sm" role="alert">
                Missing node id.
            </p>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-start gap-3">
                <Button variant="ghost" size="sm" className="-ml-2" asChild>
                    <Link
                        to="/admin/nodes"
                        className="text-muted-foreground gap-1.5"
                    >
                        <ArrowLeft className="size-4" aria-hidden />
                        Back to nodes
                    </Link>
                </Button>
            </div>

            {isError && (
                <p className="text-destructive text-sm" role="alert">
                    {error instanceof Error
                        ? error.message
                        : "Failed to load node."}
                </p>
            )}

            {isLoading && <NodeDetailSkeletons />}

            {!isLoading && node && (
                <NodeDetailContent node={node} />
            )}

            {!isLoading && !isError && node && (
                <>
                    <section
                        aria-label="Resource usage"
                        className="grid gap-3 sm:grid-cols-3"
                    >
                        {[
                            {
                                key: "cpu",
                                label: "Processor",
                                value: `${cpuPercent.toFixed(2)}%`,
                                hint: "current utilization",
                                icon: Cpu,
                                load: cpuLoadPct,
                            },
                            {
                                key: "ram",
                                label: "Memory",
                                value: `${memoryUsedMB} / ${memoryTotalMB} MB`,
                                hint: "system RAM usage",
                                icon: MemoryStick,
                                load: memLoadPct,
                            },
                            {
                                key: "disk",
                                label: "Storage",
                                value: `${diskUsedGB.toFixed(2)} / ${diskTotalGB.toFixed(2)} GB`,
                                hint: "disk space used",
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
                            <div className="divide-border/60 grid divide-y lg:grid-cols-3 lg:divide-x lg:divide-y-0">
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
                                                    id="fillCpuNode"
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
                                                domain={[0, history.cpu.length > 0 ? 'auto' : 100]}
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
                                                                {Number(value).toFixed(2)}%
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
                                                fill="url(#fillCpuNode)"
                                                fillOpacity={1}
                                                isAnimationActive={false}
                                            />
                                        </AreaChart>
                                    </ChartContainer>
                                </div>
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
                                                    id="fillMemoryNode"
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
                                                    Math.max(memoryTotalMB, 100),
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
                                                                {Number(value).toFixed(0)} MB
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
                                                fill="url(#fillMemoryNode)"
                                                fillOpacity={1}
                                                isAnimationActive={true}
                                            />
                                        </AreaChart>
                                    </ChartContainer>
                                </div>
                                <div className="p-4 sm:p-5">
                                    <p className="text-muted-foreground mb-3 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
                                        <HardDrive className="text-chart-2 size-3.5" />
                                        Disk
                                    </p>
                                    <ChartContainer
                                        config={diskChartConfig}
                                        className="aspect-auto h-50 w-full [&_.recharts-surface]:overflow-visible"
                                    >
                                        <AreaChart
                                            data={diskChartData}
                                            margin={{
                                                left: 4,
                                                right: 4,
                                                top: 4,
                                                bottom: 0,
                                            }}
                                        >
                                            <defs>
                                                <linearGradient
                                                    id="fillDiskNode"
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
                                                    Math.max(diskTotalGB, 10),
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
                                                                {Number(value).toFixed(2)} GB
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
                                                fill="url(#fillDiskNode)"
                                                fillOpacity={1}
                                                isAnimationActive={true}
                                            />
                                        </AreaChart>
                                    </ChartContainer>
                                </div>
                            </div>
                        </div>
                    </section>
                </>
            )}

            {!isLoading && !isError && !node && (
                <p className="text-muted-foreground text-sm">
                    Node not found.
                </p>
            )}

            <div className="text-muted-foreground space-y-1 text-xs">
                <p>
                    <span className="text-foreground font-medium">ID:</span>{" "}
                    {node?.id}
                </p>
                <p>
                    <span className="text-foreground font-medium">UUID:</span>{" "}
                    {node?.uuid}
                </p>
            </div>
        </div>
    )
}

export default NodeDetail
