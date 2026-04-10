import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "@tanstack/react-router"
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { useNode } from "@/db/queries/useNode"
import {
    nodeCreateFormSchema,
    type CreateNodeRequest,
    type NodeCreateFormValues,
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
import { Textarea } from "@/components/ui/textarea"

// Checked
const NodeCreate = () => {
    const navigate = useNavigate()
    const { createNodeMutation } = useNode()

    const form = useForm<NodeCreateFormValues>({
        resolver: zodResolver(nodeCreateFormSchema) as never,
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
            allocations: [],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "allocations",
    })

    const pending = createNodeMutation.isPending

    const onSubmit = form.handleSubmit((raw) => {
        const payload = raw as unknown as CreateNodeRequest

        createNodeMutation.mutate(payload, {
            onSuccess: (response: {
                data?: { message?: string; node?: { uuid?: string } }
                message?: string
            }) => {
                const inner = response?.data?.message
                toast.success(
                    typeof inner === "string" && inner.length > 0
                        ? inner
                        : "Node created.",
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
                    anyErr.response?.data?.message ?? "Failed to create node.",
                )
            },
        })
    })

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

            <div>
                <h1 className="text-foreground text-xl font-semibold tracking-tight md:text-2xl">
                    Create node
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    Configure a new node and its initial allocations.
                </p>
            </div>

            <Card className="shadow-sm">
                <CardContent className="pt-6">
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
                                        <FormLabel>Location code</FormLabel>
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

                            <div className="sm:col-span-2 space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium leading-none">
                                        Allocations
                                    </p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={pending}
                                        className="cursor-pointer"
                                        onClick={() => append({ ip: "" })}
                                    >
                                        <Plus className="size-3.5" aria-hidden />
                                        Add IP
                                    </Button>
                                </div>

                                {fields.length === 0 && (
                                    <p className="text-muted-foreground text-xs">
                                        No allocations added. The node will be created without any initial IP allocations.
                                    </p>
                                )}

                                {fields.map((field, index) => (
                                    <FormField
                                        key={field.id}
                                        control={form.control}
                                        name={`allocations.${index}.ip`}
                                        render={({ field: ipField }) => (
                                            <FormItem>
                                                <div className="flex gap-2">
                                                    <FormControl>
                                                        <Input
                                                            {...ipField}
                                                            autoComplete="off"
                                                            placeholder="0.0.0.0"
                                                            disabled={pending}
                                                        />
                                                    </FormControl>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        disabled={pending}
                                                        className="shrink-0 cursor-pointer text-muted-foreground hover:text-destructive"
                                                        onClick={() => remove(index)}
                                                        aria-label={`Remove allocation ${index + 1}`}
                                                    >
                                                        <Trash2 className="size-4" aria-hidden />
                                                    </Button>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                ))}
                            </div>

                            <div className="sm:col-span-2">
                                <Button
                                    type="submit"
                                    disabled={pending}
                                    className="touch-manipulation cursor-pointer"
                                >
                                    {pending ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin" />
                                            Creating…
                                        </>
                                    ) : (
                                        "Create node"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}

export default NodeCreate
