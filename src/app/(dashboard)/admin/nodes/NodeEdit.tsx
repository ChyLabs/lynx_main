import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link, useNavigate, useParams } from "@tanstack/react-router"
import { ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { useNode } from "@/db/queries/useNode"
import {
    nodeEditFormSchema,
    type NodeEditFormValues,
    type NodeRecord,
    type NodeUpdatePayload,
} from "@/validators/node.validator"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"

// Checked
const NodeEdit = () => {
    const navigate = useNavigate()
    const params = useParams({ strict: false })
    const node_uuid = params.node_uuid as string | undefined

    const { getNodeByUuid, updateNodeMutation } = useNode()
    const { data, isLoading, isError, error } = getNodeByUuid(node_uuid ?? "")
    const node = data?.data?.node

    const form = useForm({
        resolver: zodResolver(nodeEditFormSchema) as never,
        defaultValues: {
            name: "",
            description: "",
            location: "",
            location_code: "",
            host: "",
            port: "",
            domain: "",
            memory: "",
            disk: "",
            cpu: "",
        }
    })

    useEffect(() => {
        if (!node) return
        form.reset({
            name: node.name,
            description: node.description ?? "",
            location: node.location,
            location_code: node.location_code,
            host: node.host,
            port: String(node.port),
            domain: node.domain ?? "",
            memory: String(node.memory),
            disk: String(node.disk),
            cpu: String(node.cpu),
        })
    }, [node, form.reset])

    const pending = updateNodeMutation.isPending

    const onSubmit = form.handleSubmit((raw) => {
        if (!node_uuid) return
        const nodes = raw as unknown as NodeUpdatePayload

        updateNodeMutation.mutate(
            { uuid: node_uuid, nodes },
            {
                onSuccess: (response: {
                    data?: { message?: string; node?: { uuid?: string } }
                    message?: string
                }) => {
                    const inner = response?.data?.message
                    toast.success(
                        typeof inner === "string" && inner.length > 0
                            ? inner
                            : "Node updated.",
                    )
                    const node_uuid = response?.data?.node?.uuid
                    if (node_uuid) {
                        void navigate({ to: "/admin/nodes/$node_uuid", params: { node_uuid } })
                    } else {
                        void navigate({ to: "/admin/nodes" })
                    }
                },
                onError: (err: unknown) => {
                    const anyErr = err as {
                        response?: { data?: { message?: string } }
                    }
                    toast.error(
                        anyErr.response?.data?.message ?? "Update failed.",
                    )
                },
            },
        )
    })

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

            {isLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-8 w-36 rounded-md md:h-9" />
                    <Skeleton className="h-4 max-w-lg rounded-md" />
                </div>
            ) : (
                <div>
                    <h1 className="text-foreground text-xl font-semibold tracking-tight md:text-2xl">
                        Edit node
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Update node connection details and resource limits.
                    </p>
                </div>
            )}

            {isError && (
                <p className="text-destructive text-sm" role="alert">
                    {error instanceof Error
                        ? error.message
                        : "Failed to load node."}
                </p>
            )}

            {!isError && (
                <Card className="shadow-sm">
                    <CardContent className="pt-6">
                        {isLoading && (
                            <div
                                className="grid gap-6 sm:grid-cols-2"
                                aria-hidden
                            >
                                <div className="space-y-2 sm:col-span-2">
                                    <Skeleton className="h-4 w-12" />
                                    <Skeleton className="h-9 w-full rounded-md" />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="min-h-[4.75rem] w-full rounded-md" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-9 w-full rounded-md" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-28" />
                                    <Skeleton className="h-9 w-full rounded-md" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-10" />
                                    <Skeleton className="h-9 w-full rounded-md" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-9" />
                                    <Skeleton className="h-9 w-full rounded-md" />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <Skeleton className="h-4 w-14" />
                                    <Skeleton className="h-9 w-full rounded-md" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-9 w-full rounded-md" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-28" />
                                    <Skeleton className="h-9 w-full rounded-md" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-9 w-full rounded-md" />
                                </div>
                                <div className="space-y-2 sm:col-span-2 pt-1">
                                    <div className="flex flex-wrap gap-x-2 gap-y-1">
                                        <Skeleton className="h-3 w-7" />
                                        <Skeleton className="h-3 w-40" />
                                    </div>
                                    <div className="flex flex-wrap gap-x-2 gap-y-1">
                                        <Skeleton className="h-3 w-10" />
                                        <Skeleton className="h-3 w-56" />
                                    </div>
                                </div>
                                <div className="sm:col-span-2">
                                    <Skeleton className="h-9 w-[7.5rem] rounded-md" />
                                </div>
                            </div>
                        )}

                        {!isLoading && node && (
                            <Form {...form}>
                                <form
                                    onSubmit={onSubmit}
                                    className="grid gap-6 sm:grid-cols-2"
                                    noValidate
                                >
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem className="sm:col-span-2">
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        autoComplete="off"
                                                        disabled={pending}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem className="sm:col-span-2">
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        {...field}
                                                        rows={3}
                                                        disabled={pending}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="location"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Location</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        autoComplete="off"
                                                        disabled={pending}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="location_code"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Location code
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        autoComplete="off"
                                                        disabled={pending}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="host"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Host</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        autoComplete="off"
                                                        disabled={pending}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="port"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Port</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="number"
                                                        min={1}
                                                        max={65535}
                                                        disabled={pending}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="domain"
                                        render={({ field }) => (
                                            <FormItem className="sm:col-span-2">
                                                <FormLabel>Domain</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        autoComplete="off"
                                                        placeholder="https://"
                                                        disabled={pending}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="cpu"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>CPU (cores)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="number"
                                                        min={1}
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
                                                <FormLabel>Memory (MB)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="number"
                                                        min={0}
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
                                                <FormLabel>Disk (MB)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="number"
                                                        min={0}
                                                        disabled={pending}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="text-muted-foreground space-y-1 text-xs sm:col-span-2">
                                        <p>
                                            <span className="font-medium text-foreground">
                                                ID:
                                            </span>{" "}
                                            {node.id}
                                        </p>
                                        <p>
                                            <span className="font-medium text-foreground">
                                                UUID:
                                            </span>{" "}
                                            {node.uuid}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2 sm:col-span-2">
                                        <Button
                                            type="submit"
                                            disabled={pending}
                                            className="touch-manipulation cursor-pointer"
                                        >
                                            {pending ? (
                                                <>
                                                    <Loader2 className="size-4 animate-spin" />
                                                    Saving…
                                                </>
                                            ) : (
                                                "Save changes"
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        )}

                        {!isLoading && !node && (
                            <p className="text-muted-foreground text-sm">
                                Node not found.
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default NodeEdit
