import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link, useParams, useNavigate } from "@tanstack/react-router"
import { ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { useServer } from "@/db/queries/useServer"
import {
    serverEditFormSchema,
    type ServerEditFormValues,
    type UpdateServerPayload,
} from "@/types/app/server.types"
import type { Servers } from "@/types/app.types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

// Checked
const ServerEdit = () => {
    const navigate = useNavigate()
    const params = useParams({ strict: false })
    const node_uuid = params.node_uuid as string | undefined
    const server_uuid = params.server_uuid as string | undefined

    const { getServerByUuid, updateServerMutation } = useServer()
    const { data, isLoading, isError, error } = getServerByUuid(server_uuid ?? "")
    const server = data?.data?.server as Servers | undefined

    const form = useForm<ServerEditFormValues>({
        resolver: zodResolver(serverEditFormSchema) as never,
        defaultValues: {
            name: "",
            memory: "",
            cpu: "",
        }
    })

    useEffect(() => {
        if (!server) return
        form.reset({
            name: server.name,
            memory: server.memory,
            cpu: String(server.cpu),
        })
    }, [server, form])

    const pending = updateServerMutation.isPending

    const onSubmit = form.handleSubmit((raw) => {
        if (!node_uuid || !server_uuid) return
        const serverData = raw as unknown as UpdateServerPayload

        updateServerMutation.mutate(
            { node_uuid: node_uuid, server_uuid: server_uuid, server: serverData },
            {
                onSuccess: (payload: {
                    data?: { message?: string }
                    message?: string
                }) => {
                    const inner = payload?.data?.message
                    toast.success(
                        typeof inner === "string" && inner.length > 0
                            ? inner
                            : "Server updated successfully.",
                    )
                    navigate({
                        to: "/admin/nodes/$node_uuid/servers",
                        params: { node_uuid },
                    })
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

    if (!node_uuid || !server_uuid) {
        return (
            <p className="text-muted-foreground text-sm" role="alert">
                Missing node or server ID.
            </p>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-start gap-3">
                <Button variant="ghost" size="sm" className="-ml-2" asChild>
                    <Link
                        to="/admin/servers"
                        className="text-muted-foreground gap-1.5"
                    >
                        <ArrowLeft className="size-4" aria-hidden />
                        Back to servers
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
                        Edit server
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Update server resource allocations.
                    </p>
                </div>
            )}

            {isError && (
                <p className="text-destructive text-sm" role="alert">
                    {error instanceof Error
                        ? error.message
                        : "Failed to load server."}
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
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-9 w-full rounded-md" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-10" />
                                    <Skeleton className="h-9 w-full rounded-md" />
                                </div>
                                <div className="sm:col-span-2">
                                    <Skeleton className="h-9 w-30 rounded-md" />
                                </div>
                            </div>
                        )}

                        {!isLoading && server && (
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
                                                        placeholder="my-server"
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
                                                        min="1"
                                                        disabled={pending}
                                                        placeholder="1024"
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    RAM allocation in megabytes
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="cpu"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>CPU Cores</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="number"
                                                        min="1"
                                                        disabled={pending}
                                                        placeholder="2"
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Number of CPU cores
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="sm:col-span-2">
                                        <Button
                                            type="submit"
                                            disabled={pending}
                                            className="touch-manipulation cursor-pointer"
                                        >
                                            {pending ? (
                                                <>
                                                    <Loader2 className="size-4 animate-spin" />
                                                    Updating…
                                                </>
                                            ) : (
                                                "Update server"
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default ServerEdit