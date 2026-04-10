import { Link, useParams } from "@tanstack/react-router"
import { ArrowLeft, Plus } from "lucide-react"

import { useAllocation } from "@/db/queries/useAllocation"
import type { AllocationWithServer } from "@/types/app/allocation.types"
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
import { Badge } from "@/components/ui/badge"

// Checked
const NodeAllocations = () => {
    const params = useParams({ strict: false })
    const node_uuid = params.node_uuid as string | undefined

    const { getAllAllocationsByNodeId } = useAllocation()
    const { data, isLoading, isError, error } = getAllAllocationsByNodeId(
        node_uuid ?? "",
    )

    const allocations = data?.data?.allocations as AllocationWithServer[] | undefined
    const isEmpty =
        !isLoading &&
        !isError &&
        Array.isArray(allocations) &&
        allocations.length === 0
    const showTable =
        isLoading || (Array.isArray(allocations) && allocations.length > 0)

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
                        to="/admin/nodes/$node_uuid"
                        params={{ node_uuid }}
                        className="text-muted-foreground gap-1.5"
                    >
                        <ArrowLeft className="size-4" aria-hidden />
                        Back to node
                    </Link>
                </Button>
            </div>

            {isLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-8 w-36 rounded-md md:h-9" />
                    <Skeleton className="h-4 max-w-sm rounded-md" />
                </div>
            ) : (
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-foreground text-xl font-semibold tracking-tight md:text-2xl">
                            Allocations
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            IP allocations assigned to this node.
                        </p>
                    </div>
                    <Button
                        size="sm"
                        className="touch-manipulation cursor-pointer"
                        asChild
                    >
                        <Link
                            to="/admin/nodes/$node_uuid/allocations/create"
                            params={{ node_uuid }}
                        >
                            <Plus className="size-3.5" aria-hidden />
                            New allocation
                        </Link>
                    </Button>
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
                                : "Failed to load allocations."}
                        </p>
                    )}

                    {isEmpty && (
                        <p className="text-muted-foreground px-6 py-12 text-center text-sm">
                            No allocations yet.
                        </p>
                    )}

                    {showTable && (
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="pl-6">IP address</TableHead>
                                    <TableHead>Server</TableHead>
                                    <TableHead className="pr-6 text-right">
                                        Status
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading && (
                                    <>
                                        {Array.from({ length: 4 }).map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell className="pl-6">
                                                    <Skeleton className="h-4 w-28" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-4 w-36" />
                                                </TableCell>
                                                <TableCell className="pr-6 text-right">
                                                    <Skeleton className="ml-auto h-5 w-16 rounded-full" />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </>
                                )}

                                {!isLoading &&
                                    allocations?.map((allocation) => (
                                        <TableRow key={allocation.id}>
                                            <TableCell className="pl-6 font-mono text-sm">
                                                {allocation.ip}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {allocation.server
                                                    ? allocation.server.name
                                                    : "—"}
                                            </TableCell>
                                            <TableCell className="pr-6 text-right">
                                                {allocation.server ? (
                                                    <Badge variant="secondary">
                                                        In use
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline">
                                                        Free
                                                    </Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default NodeAllocations
