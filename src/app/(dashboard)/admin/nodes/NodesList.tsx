import { Link } from "@tanstack/react-router";
import { Eye, MoreVertical, Network, Pencil, Plus, Server } from "lucide-react";
import { useNode } from "@/db/queries/useNode";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

type NodeListRow = {
    id: string;
    uuid: string;
    name: string;
    description?: string;
    location: string;
    location_code: string;
    host: string;
    port: number;
    memory: number;
    domain?: string;
    disk: number;
    cpu: number;
    created_at: string;
    updated_at: string;
};

const formatMegabytes = (mb: number): string => {
    if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
    return `${mb} MB`;
}

function formatDate(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

// Checked
const NodesList = () => {
    const { getAllNodes } = useNode();
    const { data, isLoading, isError, error } = getAllNodes;
    const nodes = data?.data?.nodes as NodeListRow[] | undefined;
    const isEmpty =
        !isLoading &&
        !isError &&
        Array.isArray(nodes) &&
        nodes.length === 0;
    const showTable =
        isLoading || (Array.isArray(nodes) && nodes.length > 0);

    return (
        <div className="space-y-4">
            {isLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-8 w-28 rounded-md md:h-9" />
                    <Skeleton className="h-4 max-w-md rounded-md" />
                </div>
            ) : (
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-foreground text-xl font-semibold tracking-tight md:text-2xl">
                            Nodes
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Infrastructure nodes available to the panel.
                        </p>
                    </div>
                    <Button
                        size="sm"
                        className="touch-manipulation cursor-pointer"
                        asChild
                    >
                        <Link to="/admin/nodes/create">
                            <Plus className="size-3.5" aria-hidden />
                            New node
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
                                : "Failed to load nodes."}
                        </p>
                    )}
                    {isEmpty && (
                        <p className="text-muted-foreground px-6 py-12 text-center text-sm">
                            No nodes yet.
                        </p>
                    )}
                    {showTable && (
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="pl-6">Name</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead className="text-right">
                                        CPU
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Memory
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Disk
                                    </TableHead>
                                    <TableHead>Updated</TableHead>
                                    <TableHead className="pr-6 text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading && (
                                    <>
                                        <TableRow>
                                            <TableCell className="pl-6">
                                                <Skeleton className="h-4 w-36 max-w-full" />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Skeleton className="h-4 w-9" />
                                                    <Skeleton className="h-4 w-44" />
                                                </div>
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
                                                <Skeleton className="h-4 w-36" />
                                            </TableCell>
                                            <TableCell className="pr-6 text-right">
                                                <Skeleton className="ml-auto h-8 w-8 rounded-md" />
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="pl-6">
                                                <Skeleton className="h-4 w-32 max-w-full" />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Skeleton className="h-4 w-8" />
                                                    <Skeleton className="h-4 w-40" />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Skeleton className="ml-auto h-4 w-5" />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Skeleton className="ml-auto h-4 w-12" />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Skeleton className="ml-auto h-4 w-12" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-4 w-32" />
                                            </TableCell>
                                            <TableCell className="pr-6 text-right">
                                                <Skeleton className="ml-auto h-8 w-8 rounded-md" />
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="pl-6">
                                                <Skeleton className="h-4 w-40 max-w-full" />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Skeleton className="h-4 w-10" />
                                                    <Skeleton className="h-4 w-36" />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Skeleton className="ml-auto h-4 w-5" />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Skeleton className="ml-auto h-4 w-16" />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Skeleton className="ml-auto h-4 w-16" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-4 w-40" />
                                            </TableCell>
                                            <TableCell className="pr-6 text-right">
                                                <Skeleton className="ml-auto h-8 w-8 rounded-md" />
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="pl-6">
                                                <Skeleton className="h-4 w-28 max-w-full" />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Skeleton className="h-4 w-7" />
                                                    <Skeleton className="h-4 w-48" />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Skeleton className="ml-auto h-4 w-5" />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Skeleton className="ml-auto h-4 w-10" />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Skeleton className="ml-auto h-4 w-10" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-4 w-28" />
                                            </TableCell>
                                            <TableCell className="pr-6 text-right">
                                                <Skeleton className="ml-auto h-8 w-8 rounded-md" />
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="pl-6">
                                                <Skeleton className="h-4 w-44 max-w-full" />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Skeleton className="h-4 w-12" />
                                                    <Skeleton className="h-4 w-32" />
                                                </div>
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
                                                <Skeleton className="h-4 w-44" />
                                            </TableCell>
                                            <TableCell className="pr-6 text-right">
                                                <Skeleton className="ml-auto h-8 w-8 rounded-md" />
                                            </TableCell>
                                        </TableRow>
                                    </>
                                )}
                                {!isLoading &&
                                    nodes?.map((node) => (
                                        <TableRow key={node.uuid}>
                                            <TableCell className="pl-6 font-medium">
                                                <Link
                                                    to="/admin/nodes/$nodeId"
                                                    params={{ nodeId: node.uuid }}
                                                    className="text-primary hover:underline"
                                                >
                                                    {node.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-muted-foreground mr-2">
                                                    {node.location_code}
                                                </span>
                                                {node.location}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {node.cpu}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {formatMegabytes(node.memory)}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {formatMegabytes(node.disk)}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-xs whitespace-normal">
                                                {formatDate(node.updated_at)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreVertical className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link
                                                                to="/admin/nodes/$nodeId"
                                                                params={{
                                                                    nodeId: node.uuid,
                                                                }}
                                                                className="cursor-pointer"
                                                            >
                                                                <Eye className="mr-2 size-4" />
                                                                View
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link
                                                                to="/admin/nodes/$nodeId/servers/provision"
                                                                params={{
                                                                    nodeId: node.uuid,
                                                                }}
                                                                className="cursor-pointer"
                                                            >
                                                                <Server className="mr-2 size-4" />
                                                                Provision
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link
                                                                to="/admin/nodes/$nodeId/allocations"
                                                                params={{
                                                                    nodeId: node.uuid,
                                                                }}
                                                                className="cursor-pointer"
                                                            >
                                                                <Network className="mr-2 size-4" />
                                                                Allocations
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link
                                                                to="/admin/nodes/$nodeId/edit"
                                                                params={{
                                                                    nodeId: node.uuid,
                                                                }}
                                                                className="cursor-pointer"
                                                            >
                                                                <Pencil className="mr-2 size-4" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default NodesList;
