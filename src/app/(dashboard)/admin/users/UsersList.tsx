import { Link } from "@tanstack/react-router"
import { Pencil, Users } from "lucide-react"

import { useUser } from "@/db/queries/useUser"
import type { UserRecord } from "@/validators/user.validator"
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

const formatDate = (iso: string): string => {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    return d.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    })
}

const RoleBadge = ({ role }: { role: string }) => {
    const variant =
        role === "ADMIN"
            ? ("default" as const)
            : ("secondary" as const)
    return <Badge variant={variant}>{role}</Badge>
}

const UsersList = () => {
    const { getAllUsers } = useUser()
    const { data, isLoading, isError, error } = getAllUsers

    const users = data?.data?.users as UserRecord[] | undefined
    const total = users?.length

    const isEmpty =
        !isLoading && !isError && Array.isArray(users) && users.length === 0
    const showTable =
        isLoading || (Array.isArray(users) && users.length > 0)

    return (
        <div className="space-y-4 p-6">
            {isLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-8 w-24 rounded-md md:h-9" />
                    <Skeleton className="h-4 max-w-xs rounded-md" />
                </div>
            ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-foreground text-xl font-semibold tracking-tight md:text-2xl">
                            Users
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            {typeof total === "number"
                                ? `${total} registered user${total === 1 ? "" : "s"}.`
                                : "All registered users."}
                        </p>
                    </div>
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
                                : "Failed to load users."}
                        </p>
                    )}

                    {isEmpty && (
                        <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
                            <Users className="text-muted-foreground/40 size-8" strokeWidth={1.5} />
                            <p className="text-muted-foreground text-sm">
                                No users found.
                            </p>
                        </div>
                    )}

                    {showTable && (
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="pl-6">Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead className="pr-6 text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading &&
                                    Array.from({ length: 4 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="pl-6">
                                                <div className="space-y-1">
                                                    <Skeleton className="h-4 w-28" />
                                                    <Skeleton className="h-3 w-20" />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-4 w-40" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-5 w-14 rounded-full" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-4 w-32" />
                                            </TableCell>
                                            <TableCell className="pr-6 text-right">
                                                <Skeleton className="ml-auto h-8 w-14 rounded-md" />
                                            </TableCell>
                                        </TableRow>
                                    ))}

                                {!isLoading &&
                                    users?.map((user) => (
                                        <TableRow key={user.uuid}>
                                            <TableCell className="pl-6">
                                                <Link
                                                    to="/admin/users/$userId/edit"
                                                    params={{ userId: user.uuid }}
                                                    className="group block"
                                                >
                                                    <p className="text-primary group-hover:underline text-sm font-medium">
                                                        {user.first_name} {user.last_name}
                                                    </p>
                                                    <p className="text-muted-foreground font-mono text-xs">
                                                        {user.user_name}
                                                    </p>
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {user.email}
                                            </TableCell>
                                            <TableCell>
                                                <RoleBadge
                                                    role={user.role?.name ?? "USER"}
                                                />
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                                                {formatDate(user.created_at)}
                                            </TableCell>
                                            <TableCell className="pr-6 text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        to="/admin/users/$userId/edit"
                                                        params={{ userId: user.uuid }}
                                                    >
                                                        <Pencil className="size-3.5" aria-hidden />
                                                        Edit
                                                    </Link>
                                                </Button>
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

export default UsersList
