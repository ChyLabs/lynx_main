import { cn } from "@/lib/utils"
import { useServer } from "@/db/queries/useServer"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Cpu, HardDrive, MemoryStick, Network, Server } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { useState } from "react"
import type { Servers, ServerStatus } from "@/types/app.types"



/** Stacked on small screens; three-column row from md up (no horizontal scroll). */
const rowLayout = cn(
    "flex flex-col gap-4 px-4 py-5 sm:px-6 sm:py-6",
    "md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-x-6 md:gap-y-0 md:items-center md:py-6"
)

const statusIndicator: Record<ServerStatus, string> = {
    RUNNING: "bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-heartbeat",
    STOPPED: "bg-zinc-500",
    INSTALLING: "bg-purple-400 animate-pulse",
    SUSPENDED: "bg-amber-400",
    ERROR: "bg-red-500",
}


const ServerRowSkeleton = () => {
    return (
        <li>
            <Card className={cn("gap-0 py-0 shadow-sm", "pointer-events-none")}>
                <CardContent className={cn(rowLayout, "text-card-foreground")}>
                    <div className="flex min-w-0 items-center gap-3 md:gap-4 md:justify-self-start">
                        <Skeleton className="size-10 shrink-0 rounded-md" />
                        <Skeleton className="h-6 w-[min(100%,14rem)] max-w-full shrink md:h-7" />
                    </div>

                    <span className="text-muted-foreground flex min-w-0 items-center gap-2 text-sm tabular-nums md:justify-center md:text-base">
                        <Skeleton className="size-5 shrink-0 rounded-md" />
                        <Skeleton className="h-5 min-w-0 flex-1 max-w-[min(100%,12rem)] rounded-md md:flex-none md:max-w-[12rem]" />
                    </span>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 md:justify-end">
                        <span className="text-muted-foreground flex items-center gap-2 text-sm tabular-nums md:text-base">
                            <Skeleton className="size-5 shrink-0 rounded-md" />
                            <Skeleton className="h-5 w-14 rounded-md" />
                        </span>
                        <span className="text-muted-foreground flex items-center gap-2 text-sm tabular-nums md:text-base">
                            <Skeleton className="size-5 shrink-0 rounded-md" />
                            <Skeleton className="h-5 w-10 rounded-md" />
                        </span>
                        <span className="text-muted-foreground flex items-center gap-2 text-sm tabular-nums md:text-base">
                            <Skeleton className="size-5 shrink-0 rounded-md" />
                            <Skeleton className="h-5 w-14 rounded-md" />
                        </span>
                    </div>
                </CardContent>
            </Card>
        </li>
    )
}

// Checked
const Dashboard = () => {
    const { getAllServersByUserId } = useServer()
    const { data, isLoading } = getAllServersByUserId

    const [showShared, setShowShared] = useState(false)

    const ownedServers = data?.data?.owned_servers || []
    const sharedServers = data?.data?.shared_servers || []

    const servers = showShared ? sharedServers : ownedServers

    return (
        <div className="bg-background min-h-dvh p-4 sm:p-6 md:p-8">
            <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
                <section aria-labelledby="servers-heading" className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between gap-4 px-1">
                        <h2 id="servers-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">
                            {showShared ? 'Shared Servers' : 'My Servers'}
                        </h2>
                        <div className="flex items-center gap-3">
                            <Label htmlFor="server-toggle" className="text-sm text-muted-foreground cursor-pointer">
                                {showShared ? 'Viewing Shared' : 'Viewing Owned'}
                            </Label>
                            <Switch
                                id="server-toggle"
                                checked={showShared}
                                onCheckedChange={setShowShared}
                            />
                        </div>
                    </div>
                    <div className="min-w-0">
                        <ul className="space-y-3 pt-1 sm:pt-3">
                            {isLoading &&
                                Array.from({ length: 3 }).map(
                                    (_, i) => <ServerRowSkeleton key={i} />
                                )}
                            {!isLoading && servers.length === 0 && (
                                <li>
                                    <Card className="shadow-sm">
                                        <CardContent className="flex items-center justify-center py-12 text-center">
                                            <div className="text-muted-foreground space-y-2">
                                                <Server className="mx-auto size-12 opacity-40" />
                                                <p className="text-lg font-medium">
                                                    {showShared ? 'No shared servers' : 'No servers yet'}
                                                </p>
                                                <p className="text-sm">
                                                    {showShared
                                                        ? 'No servers have been shared with you yet.'
                                                        : 'Create your first server to get started.'}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </li>
                            )}
                            {servers?.map((server: Servers) => (
                                <li key={server.uuid}>
                                    <Link to={`/dashboard/servers/${server.uuid}`} className="block">
                                        <Card
                                            className={cn(
                                                "gap-0 py-0 shadow-sm",
                                                "transition-colors hover:bg-accent/40"
                                            )}

                                        >
                                            <CardContent
                                                className={cn(
                                                    rowLayout,
                                                    "text-card-foreground cursor-pointer"
                                                )}>
                                                <div className="flex min-w-0 items-center gap-3 md:gap-4 md:justify-self-start">
                                                    <span
                                                        className="text-muted-foreground relative flex size-10 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/40"
                                                        title="Server"
                                                    >
                                                        <Server className="size-4 shrink-0" />
                                                        <span
                                                            className={cn(
                                                                "absolute -top-1 -right-1 size-3 rounded-full",
                                                                statusIndicator[server.status]
                                                            )}
                                                            title={server.status}
                                                        />
                                                    </span>
                                                    <span className="min-w-0 flex-1 truncate font-medium text-lg md:flex-none md:text-xl">
                                                        {server.name}
                                                    </span>
                                                </div>

                                                <span className="text-muted-foreground flex min-w-0 items-center gap-2 text-sm tabular-nums md:justify-center md:text-base">
                                                    <Network className="size-5 shrink-0" />
                                                    <p className="min-w-0 flex-1 truncate md:max-w-[min(100%,12rem)] md:flex-none md:text-center">
                                                        {server.allocation?.ip}
                                                    </p>
                                                </span>

                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 md:justify-end">
                                                    <span className="text-muted-foreground flex items-center gap-2 text-sm tabular-nums md:text-base">
                                                        <MemoryStick className="size-5 shrink-0" />
                                                        <p>{server.memory} MB</p>
                                                    </span>
                                                    <span className="text-muted-foreground flex items-center gap-2 text-sm tabular-nums md:text-base">
                                                        <Cpu className="size-5 shrink-0" />
                                                        <p>{server.cpu}</p>
                                                    </span>
                                                    <span className="text-muted-foreground flex items-center gap-2 text-sm tabular-nums md:text-base">
                                                        <HardDrive className="size-5 shrink-0" />
                                                        <p>{server.disk} MB</p>
                                                    </span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default Dashboard
