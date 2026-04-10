import { useParams } from "@tanstack/react-router"
import { ScrollText } from "lucide-react"

import { useServer } from "@/db/queries/useServer"
import type { ActivityLogRecord } from "@/validators/server.validator"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

function formatAction(action: string): string {
    return action
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatDate(iso: string): string {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    }).format(new Date(iso))
}

const actionStyle: Record<string, string> = {
    start_server: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    stop_server: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    restart_server: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    create_server: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    delete_server: "bg-red-500/10 text-red-300 border-red-500/20",
}

const ActionBadge = ({ action }: { action: string }) => {
    const style =
        actionStyle[action] ??
        "bg-muted/40 text-muted-foreground border-border/60"
    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-xs font-medium ${style}`}
        >
            {formatAction(action)}
        </span>
    )
}

// Checked
const ServerActivityLogs = () => {
    const params = useParams({ strict: false })
    const server_uuid = params.server_uuid as string | undefined

    const { getServerLogs } = useServer()
    const { data, isLoading, isError } = getServerLogs(server_uuid ?? "")

    const logs = data?.data?.logs as ActivityLogRecord[] | undefined

    if (!server_uuid) {
        return (
            <div className="bg-background text-muted-foreground flex min-h-40 items-center justify-center p-6 text-sm">
                Missing server uuid.
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="bg-background min-h-0 p-4 md:p-8">
                <div className="mx-auto w-full max-w-300 space-y-6">
                    <div className="flex items-center gap-3">
                        <Skeleton className="size-11 rounded-2xl" />
                        <div className="space-y-1.5">
                            <Skeleton className="h-7 w-36 rounded-md" />
                            <Skeleton className="h-3.5 w-52 rounded-md" />
                        </div>
                    </div>
                    <Skeleton className="h-72 rounded-2xl" />
                </div>
            </div>
        )
    }

    return (
        <div className="bg-background min-h-0 p-4 md:p-8">
            <div className="mx-auto flex w-full max-w-300 flex-col gap-8">

                <header className="flex flex-wrap items-center gap-3">
                    <span
                        className="bg-primary/10 text-primary ring-border/60 flex size-11 shrink-0 items-center justify-center rounded-2xl ring-1"
                        aria-hidden
                    >
                        <ScrollText className="size-5" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0">
                        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
                            Activity logs
                        </h1>
                        <p className="text-muted-foreground text-xs">
                            Last 100 actions performed on this server.
                        </p>
                    </div>
                </header>

                <section aria-label="Logs" className="space-y-2">
                    <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium tracking-wide uppercase">
                        <ScrollText className="size-3.5" />
                        Event history
                    </div>

                    <div className="border-border/80 bg-card/60 overflow-hidden rounded-2xl border shadow-sm">
                        <div className="border-border/60 bg-muted/20 px-5 py-3.5">
                            <p className="text-foreground text-sm font-medium">
                                Audit trail
                            </p>
                            <p className="text-muted-foreground text-xs">
                                {logs && logs.length > 0
                                    ? `${logs.length} event${logs.length === 1 ? "" : "s"} recorded`
                                    : "No activity recorded yet"}
                            </p>
                        </div>

                        {isError && (
                            <p
                                className="text-destructive px-5 py-4 text-sm"
                                role="alert"
                            >
                                Failed to load activity logs.
                            </p>
                        )}

                        {!isError && (!logs || logs.length === 0) && (
                            <p className="text-muted-foreground px-5 py-12 text-center text-sm">
                                No activity has been recorded for this server yet.
                            </p>
                        )}

                        {logs && logs.length > 0 && (
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="pl-5">Action</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>IP address</TableHead>
                                        <TableHead className="pr-5 text-right">
                                            Date
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="pl-5">
                                                <ActionBadge action={log.action} />
                                            </TableCell>
                                            <TableCell>
                                                {log.user?.user_name ? (
                                                    <span className="text-foreground font-mono text-xs">
                                                        {log.user.user_name}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground/50 text-xs">
                                                        —
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-muted-foreground font-mono text-xs">
                                                    {log.ip}
                                                </span>
                                            </TableCell>
                                            <TableCell className="pr-5 text-right">
                                                <span className="text-muted-foreground text-xs tabular-nums">
                                                    {formatDate(log.created_at)}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </section>

            </div>
        </div>
    )
}

export default ServerActivityLogs
