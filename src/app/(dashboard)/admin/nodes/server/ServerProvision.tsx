import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate, useParams } from "@tanstack/react-router"
import {
    ArrowLeft,
    Cpu,
    HardDrive,
    Loader2,
    MemoryStick,
    Monitor,
    Network,
    Server,
    User,
} from "lucide-react"
import { toast } from "sonner"

import { useServer } from "@/db/queries/useServer"
import { useAllocation } from "@/db/queries/useAllocation"
import { useUser } from "@/db/queries/useUser"
import {
    serverProvisionFormSchema,
    type CreateServerRequest,
    type ServerProvisionFormValues,
} from "@/validators/server.validator"
import type { AllocationWithServer } from "@/validators/allocation.validator"
import type { UserRecord } from "@/validators/user.validator"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

const DISTRO_LABELS: Record<string, string> = {
    almalinux: "AlmaLinux",
    alpine: "Alpine",
    alt: "ALT Linux",
    amazonlinux: "Amazon Linux",
    archlinux: "Arch Linux",
    busybox: "BusyBox",
    centos: "CentOS",
    debian: "Debian",
    devuan: "Devuan",
    fedora: "Fedora",
    kali: "Kali Linux",
    mint: "Linux Mint",
    nixos: "NixOS",
    openeuler: "openEuler",
    opensuse: "openSUSE",
    openwrt: "OpenWrt",
    oracle: "Oracle Linux",
    plamo: "Plamo Linux",
    rockylinux: "Rocky Linux",
    slackware: "Slackware",
    springdalelinux: "Springdale Linux",
    ubuntu: "Ubuntu",
    voidlinux: "Void Linux",
}

const IMAGES: Record<string, Record<string, string[]>> = {
    almalinux: { "10": ["amd64", "arm64"], "8": ["amd64", "arm64"], "9": ["amd64", "arm64"] },
    alpine: { "3.20": ["amd64", "arm64", "armhf", "riscv64"], "3.21": ["amd64", "arm64", "armhf", "riscv64"], "3.22": ["amd64", "arm64", "armhf", "riscv64"], "3.23": ["amd64", "arm64", "armhf", "riscv64"], "edge": ["amd64", "arm64", "armhf", "riscv64"] },
    alt: { "Sisyphus": ["amd64", "arm64"], "p11": ["amd64", "arm64"] },
    amazonlinux: { "2": ["amd64", "arm64"], "2023": ["amd64"] },
    archlinux: { "current": ["amd64", "riscv64"] },
    busybox: { "1.36.1": ["amd64", "arm64"] },
    centos: { "10-Stream": ["amd64", "arm64"], "9-Stream": ["amd64", "arm64"] },
    debian: { "bookworm": ["amd64", "arm64", "armhf"], "bullseye": ["amd64", "arm64", "armhf"], "forky": ["amd64", "arm64", "armhf", "riscv64"], "trixie": ["amd64", "arm64", "armhf", "riscv64"] },
    devuan: { "chimaera": ["amd64", "arm64"], "daedalus": ["amd64", "arm64"], "excalibur": ["amd64", "arm64"] },
    fedora: { "42": ["amd64", "arm64"], "43": ["amd64", "arm64"] },
    kali: { "current": ["amd64", "arm64"] },
    mint: { "ulyana": ["amd64"], "ulyssa": ["amd64"], "uma": ["amd64"], "una": ["amd64"], "vanessa": ["amd64"], "vera": ["amd64"], "victoria": ["amd64"], "virginia": ["amd64"], "wilma": ["amd64"], "xia": ["amd64"], "zara": ["amd64"], "zena": ["amd64"] },
    nixos: { "25.11": ["amd64", "arm64"], "unstable": ["amd64", "arm64"] },
    openeuler: { "20.03": ["amd64", "arm64"], "22.03": ["amd64", "arm64"], "24.03": ["amd64", "arm64"], "25.03": ["amd64", "arm64"], "25.09": ["amd64", "arm64"] },
    opensuse: { "15.6": ["amd64", "arm64"], "16.0": ["amd64", "arm64"], "tumbleweed": ["amd64", "arm64"] },
    openwrt: { "24.10": ["amd64", "arm64"], "25.12": ["amd64", "arm64"], "snapshot": ["amd64", "arm64"] },
    oracle: { "7": ["amd64", "arm64"], "8": ["amd64", "arm64"], "9": ["amd64", "arm64"] },
    plamo: { "8.x": ["amd64"] },
    rockylinux: { "10": ["amd64", "arm64"], "8": ["amd64", "arm64"], "9": ["amd64", "arm64"] },
    slackware: { "15.0": ["amd64"], "current": ["amd64"] },
    springdalelinux: { "7": ["amd64"], "8": ["amd64"], "9": ["amd64"] },
    ubuntu: { "jammy": ["amd64", "arm64", "armhf", "riscv64"], "noble": ["amd64", "arm64", "armhf", "riscv64"], "plucky": ["amd64", "arm64", "armhf", "riscv64"], "questing": ["amd64", "arm64", "armhf"] },
    voidlinux: { "current": ["amd64", "arm64"] },
}

const DISTRO_OPTIONS = Object.keys(IMAGES)
    .sort()
    .map((d) => ({ value: d, label: DISTRO_LABELS[d] ?? d }))

// Checked
const ServerProvision = () => {
    const params = useParams({ strict: false })
    const node_uuid = params.node_uuid as string | undefined
    const navigate = useNavigate()

    const { createServerMutation } = useServer()
    const { getAllAllocationsByNodeId } = useAllocation()
    const { getAllUsers } = useUser()

    const { data: usersData, isLoading: usersLoading } = getAllUsers
    const users = usersData?.data?.users as UserRecord[] | undefined

    const { data: allocData, isLoading: allocLoading } =
        getAllAllocationsByNodeId(node_uuid ?? "")

    const allAllocations = allocData?.data?.allocations as
        | AllocationWithServer[]
        | undefined
    const freeAllocations = allAllocations?.filter((a) => !a.server) ?? []

    const form = useForm<ServerProvisionFormValues>({
        resolver: zodResolver(serverProvisionFormSchema) as never,
        defaultValues: {
            name: "",
            password: "",
            user_uuid: "",
            distro: "",
            release: "",
            archi: "",
            allocation_uuid: "",
            memory: "",
            cpu: "",
            disk: "",
        },
    })

    const pending = createServerMutation.isPending
    const selectedDistro = form.watch("distro")
    const selectedRelease = form.watch("release")
    const availableReleases = Object.keys(IMAGES[selectedDistro] ?? {})
    const availableArchitectures = IMAGES[selectedDistro]?.[selectedRelease] ?? []

    const onSubmit = form.handleSubmit((raw) => {
        if (!node_uuid) return

        const payload: CreateServerRequest = {
            ...(raw as unknown as Omit<CreateServerRequest, "node_uuid">),
            node_uuid: node_uuid,
        }

        createServerMutation.mutate(payload, {
            onSuccess: (response: {
                data?: { message?: string }
                message?: string
            }) => {
                const inner = response?.data?.message
                toast.success(
                    typeof inner === "string" && inner.length > 0
                        ? inner
                        : "Server provisioned.",
                )
                void navigate({ to: "/admin/servers" })
            },
            onError: (err: unknown) => {
                const anyErr = err as {
                    response?: { data?: { message?: string } }
                }
                toast.error(
                    anyErr.response?.data?.message ??
                    "Failed to provision server.",
                )
            },
        })
    })

    if (!node_uuid) {
        return (
            <p className="text-muted-foreground text-sm" role="alert">
                Missing node id.
            </p>
        )
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="size-8 shrink-0" asChild>
                        <Link to="/admin/nodes/$node_uuid" params={{ node_uuid }}>
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2.5">
                        <span className="bg-primary/10 text-primary ring-border/60 flex size-9 items-center justify-center rounded-xl ring-1">
                            <Server className="size-4" strokeWidth={1.75} />
                        </span>
                        <div>
                            <h1 className="text-foreground text-lg font-semibold leading-tight">
                                Provision server
                            </h1>
                            <p className="text-muted-foreground text-xs">
                                Deploy a new server on this node.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={onSubmit} noValidate>
                    <div className="grid gap-4 lg:grid-cols-5">

                        {/* Left column */}
                        <div className="flex flex-col gap-4 lg:col-span-3">

                            {/* Identity card */}
                            <Card className="shadow-sm">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                        <User className="text-muted-foreground size-4" strokeWidth={1.75} />
                                        <CardTitle className="text-sm font-medium">Identity</CardTitle>
                                    </div>
                                    <CardDescription className="text-xs">
                                        Name, owner, and root password for this server.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-3">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Server name</FormLabel>
                                                <FormControl>
                                                    <Input {...field} autoComplete="off" disabled={pending} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="user_uuid"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Owner</FormLabel>
                                                {usersLoading ? (
                                                    <Skeleton className="h-9 w-full rounded-md" />
                                                ) : (
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                        disabled={pending || !users || users.length === 0}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue
                                                                    placeholder={
                                                                        !users || users.length === 0
                                                                            ? "No users found"
                                                                            : "Select owner"
                                                                    }
                                                                />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {users?.map((u) => (
                                                                <SelectItem key={u.uuid} value={u.uuid}>
                                                                    {u.first_name} {u.last_name}{" "}
                                                                    <span className="text-muted-foreground">
                                                                        ({u.user_name})
                                                                    </span>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Root password</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="password"
                                                        autoComplete="new-password"
                                                        disabled={pending}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Resources card */}
                            <Card className="shadow-sm">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                        <Cpu className="text-muted-foreground size-4" strokeWidth={1.75} />
                                        <CardTitle className="text-sm font-medium">Resources</CardTitle>
                                    </div>
                                    <CardDescription className="text-xs">
                                        Compute limits allocated to this server.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-3 gap-3">
                                    <FormField
                                        control={form.control}
                                        name="cpu"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-1.5">
                                                    <Cpu className="size-3 opacity-60" />
                                                    CPU
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="number"
                                                        min={1}
                                                        placeholder="cores"
                                                        disabled={pending}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="memory"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-1.5">
                                                    <MemoryStick className="size-3 opacity-60" />
                                                    Memory
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="number"
                                                        min={1}
                                                        placeholder="MB"
                                                        disabled={pending}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="disk"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-1.5">
                                                    <HardDrive className="size-3 opacity-60" />
                                                    Disk
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="number"
                                                        min={1}
                                                        placeholder="MB"
                                                        disabled={pending}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                        </div>

                        {/* Right column */}
                        <div className="flex flex-col gap-4 lg:col-span-2">

                            {/* OS card */}
                            <Card className="shadow-sm">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                        <Monitor className="text-muted-foreground size-4" strokeWidth={1.75} />
                                        <CardTitle className="text-sm font-medium">Operating system</CardTitle>
                                    </div>
                                    <CardDescription className="text-xs">
                                        Linux distribution to install.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-3">
                                    <FormField
                                        control={form.control}
                                        name="distro"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Distribution</FormLabel>
                                                <Select
                                                    onValueChange={(v) => {
                                                        field.onChange(v)
                                                        form.setValue("release", "")
                                                        form.setValue("archi", "")
                                                    }}
                                                    value={field.value}
                                                    disabled={pending}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select distro" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {DISTRO_OPTIONS.map((d) => (
                                                            <SelectItem key={d.value} value={d.value}>
                                                                {d.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="release"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Release</FormLabel>
                                                <Select
                                                    onValueChange={(v) => {
                                                        field.onChange(v)
                                                        form.setValue("archi", "")
                                                    }}
                                                    value={field.value}
                                                    disabled={
                                                        pending ||
                                                        !selectedDistro ||
                                                        availableReleases.length === 0
                                                    }
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue
                                                                placeholder={
                                                                    !selectedDistro
                                                                        ? "Select distro first"
                                                                        : "Select release"
                                                                }
                                                            />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {availableReleases.map((r) => (
                                                            <SelectItem key={r} value={r}>
                                                                {r}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="archi"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Architecture</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                    disabled={
                                                        pending ||
                                                        !selectedRelease ||
                                                        availableArchitectures.length === 0
                                                    }
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue
                                                                placeholder={
                                                                    !selectedRelease
                                                                        ? "Select release first"
                                                                        : "Select architecture"
                                                                }
                                                            />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {availableArchitectures.map((a) => (
                                                            <SelectItem key={a} value={a}>
                                                                {a}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Network card */}
                            <Card className="shadow-sm">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                        <Network className="text-muted-foreground size-4" strokeWidth={1.75} />
                                        <CardTitle className="text-sm font-medium">Network</CardTitle>
                                    </div>
                                    <CardDescription className="text-xs">
                                        Assign a free IP allocation.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <FormField
                                        control={form.control}
                                        name="allocation_uuid"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Allocation</FormLabel>
                                                {allocLoading ? (
                                                    <Skeleton className="h-9 w-full rounded-md" />
                                                ) : (
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                        disabled={
                                                            pending ||
                                                            freeAllocations.length === 0
                                                        }
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue
                                                                    placeholder={
                                                                        freeAllocations.length === 0
                                                                            ? "No free allocations"
                                                                            : "Select IP"
                                                                    }
                                                                />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {freeAllocations.map((a) => (
                                                                <SelectItem key={a.uuid} value={a.uuid}>
                                                                    {a.ip}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                        </div>
                    </div>

                    {/* Submit */}
                    <div className="mt-4 flex items-center gap-3">
                        <Button
                            type="submit"
                            disabled={pending || allocLoading || usersLoading}
                        >
                            {pending ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Provisioning…
                                </>
                            ) : (
                                "Provision server"
                            )}
                        </Button>
                        <Button variant="ghost" size="sm" asChild disabled={pending}>
                            <Link to="/admin/nodes/$node_uuid" params={{ node_uuid }}>
                                Cancel
                            </Link>
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default ServerProvision
