import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { Loader2, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { useServer } from "@/db/queries/useServer"
import type { ServerRecord, ServerStatus } from "@/types/app/server.types"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

const formatMegabytes = (raw: string | number): string => {
    const mb = Number(raw)
    if (Number.isNaN(mb)) return String(raw)
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

type StatusBadgeProps = { status: ServerStatus }

const statusVariant: Record<
    ServerStatus,
    "default" | "secondary" | "outline" | "destructive"
> = {
    RUNNING: "default",
    STOPPED: "outline",
    INSTALLING: "secondary",
    SUSPENDED: "secondary",
    ERROR: "destructive",
}

const StatusBadge = ({ status }: StatusBadgeProps) => (
    <Badge variant={statusVariant[status]}>{status}</Badge>
)

type PendingDelete = { server_uuid: string; node_uuid: string; name: string }

// Checked
const ServersList = () => {
    const { getAllServers, deleteServerMutation } = useServer()
    const { data, isLoading, isError, error } = getAllServers

    const servers = data?.data?.servers as ServerRecord[] | undefined
    const total = data?.data?.total as number | undefined

    const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null)

    const isEmpty =
        !isLoading && !isError && Array.isArray(servers) && servers.length === 0
    const showTable =
        isLoading || (Array.isArray(servers) && servers.length > 0)

    const handleDelete = () => {
        if (!pendingDelete) return

        deleteServerMutation.mutate(
            { node_uuid: pendingDelete.node_uuid, server_uuid: pendingDelete.server_uuid },
            {
                onSuccess: () => {
                    toast.success(`"${pendingDelete.name}" deleted.`)
                    setPendingDelete(null)
                },
                onError: (err: unknown) => {
                    const anyErr = err as { response?: { data?: { message?: string } } }
                    toast.error(anyErr.response?.data?.message ?? "Failed to delete server.")
                    setPendingDelete(null)
                },
            },
        )
    }

    return (
        <>
            <div className="space-y-4">
                {isLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-24 rounded-md md:h-9" />
                        <Skeleton className="h-4 max-w-xs rounded-md" />
                    </div>
                ) : (
                    <div>
                        <h1 className="text-foreground text-xl font-semibold tracking-tight md:text-2xl">
                            Servers
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            {typeof total === "number"
                                ? `${total} server${total === 1 ? "" : "s"} across all nodes.`
                                : "All servers across all nodes."}
                        </p>
                    </div>
                )}

                <Card className="gap-0 overflow-hidden py-0 shadow-sm">
                    <CardContent className="p-0">
                        {isError && (
                            <p
                                className="text-destructive border-destructive/20 bg-destructive/5 px-6 py-4 text-sm"
                                role="alert"
                            >
                                {error instanceof Error
                                    ? error.message
                                    : "Failed to load servers."}
                            </p>
                        )}

                        {isEmpty && (
                            <p className="text-muted-foreground px-6 py-12 text-center text-sm">
                                No servers found.
                            </p>
                        )}

                        {showTable && (
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="pl-6">Name</TableHead>
                                        <TableHead>IP</TableHead>
                                        <TableHead className="text-right">
                                            CPU
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Memory
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Disk
                                        </TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Updated</TableHead>
                                        <TableHead className="pr-6 text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading &&
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell className="pl-6">
                                                    <Skeleton className="h-4 w-32 max-w-full" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-4 w-28" />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Skeleton className="ml-auto h-4 w-5" />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Skeleton className="ml-auto h-4 w-14" />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Skeleton className="ml-auto h-4 w-14" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-5 w-16 rounded-full" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-4 w-36" />
                                                </TableCell>
                                                <TableCell className="pr-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Skeleton className="h-8 w-14 rounded-md" />
                                                        <Skeleton className="h-8 w-16 rounded-md" />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}

                                    {!isLoading &&
                                        servers?.map((server) => (
                                            <TableRow key={server.uuid}>
                                                <TableCell className="pl-6 font-medium">
                                                    <Link
                                                        to="/admin/nodes/$node_uuid/servers/$server_uuid/edit"
                                                        params={{
                                                            node_uuid: server.node_uuid,
                                                            server_uuid: server.uuid,
                                                        }}
                                                        className="text-primary hover:underline"
                                                    >
                                                        {server.name}
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="font-mono text-sm">
                                                    {server.allocation?.ip ?? (
                                                        <span className="text-muted-foreground">
                                                            —
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums">
                                                    {server.cpu}
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums">
                                                    {formatMegabytes(server.memory)}
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums">
                                                    {formatMegabytes(server.disk)}
                                                </TableCell>
                                                <TableCell>
                                                    <StatusBadge
                                                        status={server.status}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-xs whitespace-normal">
                                                    {formatDate(server.updated_at)}
                                                </TableCell>
                                                <TableCell className="pr-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link
                                                                to="/admin/nodes/$node_uuid/servers/$server_uuid/edit"
                                                                params={{
                                                                    node_uuid: server.node_uuid,
                                                                    server_uuid: server.uuid,
                                                                }}
                                                            >
                                                                <Pencil className="size-3.5" aria-hidden />
                                                                Edit
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() =>
                                                                setPendingDelete({
                                                                    server_uuid: server.uuid,
                                                                    node_uuid: server.node_uuid,
                                                                    name: server.name,
                                                                })
                                                            }
                                                            disabled={deleteServerMutation.isPending}
                                                        >
                                                            <Trash2 className="size-3.5" aria-hidden />
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            <AlertDialog
                open={!!pendingDelete}
                onOpenChange={(open) => { if (!open) setPendingDelete(null) }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete server</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete{" "}
                            <span className="text-foreground font-semibold">
                                {pendingDelete?.name}
                            </span>
                            ? This will permanently remove the server and all its data.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteServerMutation.isPending}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleteServerMutation.isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteServerMutation.isPending ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Deleting…
                                </>
                            ) : (
                                "Delete server"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

export default ServersList
