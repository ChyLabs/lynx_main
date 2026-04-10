import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useParams } from "@tanstack/react-router"
import { Check, ChevronsUpDown, Loader2, Plus, ShieldCheck, Users, X } from "lucide-react"
import { toast } from "sonner"

import { useServer } from "@/db/queries/useServer"
import { useUser } from "@/db/queries/useUser"
import {
    serverPermissionFormSchema,
    type ServerPermissionFormValues,
    type ServerPermissionRecord,
} from "@/validators/server.validator"
import type { UserRecord } from "@/validators/user.validator"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

type PermissionKey =
    | "can_view"
    | "can_start"
    | "can_stop"
    | "can_restart"
    | "can_backup"

const PERMISSIONS: { key: PermissionKey; label: string }[] = [
    { key: "can_view", label: "View" },
    { key: "can_start", label: "Start" },
    { key: "can_stop", label: "Stop" },
    { key: "can_restart", label: "Restart" },
    { key: "can_backup", label: "Backup" },
]

const PermissionCell = ({ allowed }: { allowed: boolean }) =>
    allowed ? (
        <Check className="size-4 text-emerald-400" aria-label="Allowed" />
    ) : (
        <X className="text-muted-foreground/50 size-4" aria-label="Denied" />
    )

// Checked
const ServerPermissions = () => {
    const params = useParams({ strict: false })
    const server_uuid = params.server_uuid as string | undefined

    const { getServerPermissions, createServerPermissionMutation } = useServer()
    const { getAllUsers } = useUser()

    const {
        data: permData,
        isLoading: permLoading,
        isError: permError,
    } = getServerPermissions(server_uuid ?? "")

    const { data: usersData, isLoading: usersLoading } = getAllUsers

    const permissions = permData?.data?.server_permissions as
        | ServerPermissionRecord[]
        | undefined

    const users = usersData?.data?.users as UserRecord[] | undefined

    const nonAdminUsers = users?.filter((u) => u.role?.name !== "ADMIN") ?? []
    const grantedIds = new Set(permissions?.map((p) => p.user_id) ?? [])
    const availableUsers = nonAdminUsers.filter((u) => !grantedIds.has(u.id))


    const userMap = new Map(nonAdminUsers.map((u) => [u.id, u]))


    const form = useForm<ServerPermissionFormValues>({
        resolver: zodResolver(serverPermissionFormSchema),
        defaultValues: {
            user_uuid: "",
            can_view: false,
            can_start: false,
            can_stop: false,
            can_restart: false,
            can_backup: false,
        },
    })

    const [open, setOpen] = useState(false)
    const pending = createServerPermissionMutation.isPending

    const onSubmit = form.handleSubmit((values) => {
        if (!server_uuid) return

        createServerPermissionMutation.mutate(
            { server_uuid: server_uuid, ...values },
            {
                onSuccess: (response: {
                    data?: { message?: string }
                    message?: string
                }) => {
                    const inner = response?.data?.message
                    toast.success(
                        typeof inner === "string" && inner.length > 0
                            ? inner
                            : "Permission granted.",
                    )
                    form.reset()
                    setOpen(false)
                },
                onError: (err: unknown) => {
                    const anyErr = err as {
                        response?: { data?: { message?: string } }
                    }
                    toast.error(
                        anyErr.response?.data?.message ??
                        "Failed to grant permission.",
                    )
                },
            },
        )
    })

    if (!server_uuid) {
        return (
            <div className="bg-background text-muted-foreground flex min-h-40 items-center justify-center p-6 text-sm">
                Missing server id.
            </div>
        )
    }

    if (permLoading) {
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
                    <Skeleton className="h-48 rounded-2xl" />
                    <Skeleton className="h-64 rounded-2xl" />
                </div>
            </div>
        )
    }

    const visiblePermissions =
        permissions?.filter((p) => {
            const u = users?.find((u) => u.id === p.user_id)
            return !u || u.role?.name !== "ADMIN"
        }) ?? []
    const hasPermissions = visiblePermissions.length > 0

    return (
        <div className="bg-background min-h-0 p-4 md:p-8">
            <div className="mx-auto flex w-full max-w-300 flex-col gap-8">

                <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                        <span
                            className="bg-primary/10 text-primary ring-border/60 flex size-11 shrink-0 items-center justify-center rounded-2xl ring-1"
                            aria-hidden
                        >
                            <ShieldCheck className="size-5" strokeWidth={1.75} />
                        </span>
                        <div className="min-w-0">
                            <h1 className="text-foreground text-2xl font-semibold tracking-tight">
                                Permissions
                            </h1>
                            <p className="text-muted-foreground text-xs">
                                Manage which users can access and control this server.
                            </p>
                        </div>
                    </div>

                    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) form.reset(); }}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 rounded-xl cursor-pointer">
                                <Plus className="size-4" />
                                Grant permission
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Grant permission</DialogTitle>
                                <DialogDescription>
                                    Select a user and choose which actions they are allowed to perform.
                                </DialogDescription>
                            </DialogHeader>

                            <Form {...form}>
                                <form
                                    onSubmit={onSubmit}
                                    className="space-y-5"
                                    noValidate
                                >
                                    <FormField
                                        control={form.control}
                                        name="user_uuid"
                                        render={({ field }) => {
                                            const selected = availableUsers.find(
                                                (u) => u.uuid === field.value,
                                            )
                                            return (
                                                <FormItem>
                                                    <FormLabel>User</FormLabel>
                                                    {usersLoading ? (
                                                        <Skeleton className="h-9 w-full rounded-md" />
                                                    ) : (
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <FormControl>
                                                                    <Button
                                                                        variant="outline"
                                                                        role="combobox"
                                                                        disabled={
                                                                            pending ||
                                                                            availableUsers.length === 0
                                                                        }
                                                                        className={cn(
                                                                            "w-full justify-between font-normal",
                                                                            !field.value && "text-muted-foreground",
                                                                        )}
                                                                    >
                                                                        {selected
                                                                            ? `${selected.first_name} ${selected.last_name} (${selected.user_name})`
                                                                            : availableUsers.length === 0
                                                                                ? "All users already have access"
                                                                                : "Search user…"}
                                                                        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                                                                    </Button>
                                                                </FormControl>
                                                            </PopoverTrigger>
                                                            <PopoverContent
                                                                className="w-[--radix-popover-trigger-width] p-0"
                                                                align="start"
                                                            >
                                                                <Command>
                                                                    <CommandInput placeholder="Search by name or username…" />
                                                                    <CommandList>
                                                                        <CommandEmpty>No users found.</CommandEmpty>
                                                                        <CommandGroup>
                                                                            {availableUsers.map((u) => (
                                                                                <CommandItem
                                                                                    key={u.uuid}
                                                                                    value={`${u.first_name} ${u.last_name} ${u.user_name}`}
                                                                                    onSelect={() =>
                                                                                        field.onChange(u.uuid)
                                                                                    }
                                                                                >
                                                                                    <Check
                                                                                        className={cn(
                                                                                            "mr-2 size-4",
                                                                                            field.value === u.uuid
                                                                                                ? "opacity-100"
                                                                                                : "opacity-0",
                                                                                        )}
                                                                                    />
                                                                                    <div>
                                                                                        <p className="text-sm font-medium">
                                                                                            {u.first_name} {u.last_name}
                                                                                        </p>
                                                                                        <p className="text-muted-foreground text-xs">
                                                                                            {u.user_name}
                                                                                        </p>
                                                                                    </div>
                                                                                </CommandItem>
                                                                            ))}
                                                                        </CommandGroup>
                                                                    </CommandList>
                                                                </Command>
                                                            </PopoverContent>
                                                        </Popover>
                                                    )}
                                                    <FormMessage />
                                                </FormItem>
                                            )
                                        }}
                                    />

                                    <div className="space-y-2">
                                        <p className="text-foreground text-sm font-medium">
                                            Actions
                                        </p>
                                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                            {PERMISSIONS.map((p) => (
                                                <FormField
                                                    key={p.key}
                                                    control={form.control}
                                                    name={p.key}
                                                    render={({ field }) => (
                                                        <FormItem className="border-border/80 bg-muted/25 flex flex-row items-center gap-2.5 rounded-xl border px-3.5 py-3">
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value}
                                                                    onCheckedChange={field.onChange}
                                                                    disabled={pending}
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="cursor-pointer font-normal">
                                                                {p.label}
                                                            </FormLabel>
                                                        </FormItem>
                                                    )}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={pending || usersLoading}
                                        className="w-full gap-2"
                                    >
                                        {pending ? (
                                            <div className="cursor-pointer flex items-center">
                                                <Loader2 className="size-4 animate-spin" />
                                                Granting…
                                            </div>
                                        ) : (
                                            <div className="cursor-pointer flex items-center">
                                                <ShieldCheck className="size-4" />
                                                Grant permission
                                            </div>
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </header>

                {/* Existing permissions */}
                <section aria-label="Granted users" className="space-y-2">
                    <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium tracking-wide uppercase">
                        <Users className="size-3.5" />
                        Granted users
                    </div>

                    <div className="border-border/80 bg-card/60 overflow-hidden rounded-2xl border shadow-sm">
                        <div className="border-border/60 bg-muted/20 px-5 py-3.5">
                            <p className="text-foreground text-sm font-medium">
                                Access list
                            </p>
                            <p className="text-muted-foreground text-xs">
                                {hasPermissions
                                    ? `${visiblePermissions.length} user${visiblePermissions.length === 1 ? "" : "s"} have been granted access`
                                    : "No permissions have been granted yet"}
                            </p>
                        </div>

                        {permError && (
                            <p
                                className="text-destructive px-5 py-4 text-sm"
                                role="alert"
                            >
                                Failed to load permissions.
                            </p>
                        )}

                        {!permError && !hasPermissions && !permLoading && (
                            <p className="text-muted-foreground px-5 py-10 text-center text-sm">
                                No permissions granted yet. Use the form below to give a user access.
                            </p>
                        )}

                        {hasPermissions && (
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="pl-5">User</TableHead>
                                        {PERMISSIONS.map((p) => (
                                            <TableHead
                                                key={p.key}
                                                className="text-center"
                                            >
                                                {p.label}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {visiblePermissions.map((perm) => {
                                        const user = userMap.get(perm.user_id)

                                        return (
                                            <TableRow key={perm.user_id}>
                                                <TableCell className="pl-5">
                                                    {user ? (
                                                        <div>
                                                            <p className="text-foreground text-sm font-medium">
                                                                {user.first_name}{" "}
                                                                {user.last_name}
                                                            </p>
                                                            <p className="text-muted-foreground text-xs">
                                                                {user.user_name}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground font-mono text-xs">
                                                            {perm.user_id}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                {PERMISSIONS.map((p) => (
                                                    <TableCell
                                                        key={p.key}
                                                        className="text-center"
                                                    >
                                                        <div className="flex justify-center">
                                                            <PermissionCell
                                                                allowed={perm[p.key]}
                                                            />
                                                        </div>
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </section>

            </div>
        </div>
    )
}

export default ServerPermissions
