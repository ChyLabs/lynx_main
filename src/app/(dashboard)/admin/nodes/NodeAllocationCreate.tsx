import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate, useParams } from "@tanstack/react-router"
import { ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { useAllocation } from "@/db/queries/useAllocation"
import {
    allocationCreateFormSchema,
    type AllocationCreateFormValues,
} from "@/validators/allocation.validator"
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

// Checked
const NodeAllocationCreate = () => {
    const params = useParams({ strict: false })
    const node_uuid = params.node_uuid as string | undefined
    const navigate = useNavigate()

    const { createAllocationMutation } = useAllocation()

    const form = useForm<AllocationCreateFormValues>({
        resolver: zodResolver(allocationCreateFormSchema) as never,
        defaultValues: {
            ip: "",
        },
    })

    const pending = createAllocationMutation.isPending

    const onSubmit = form.handleSubmit((raw) => {
        if (!node_uuid) return

        const ip = (raw as { ip: string }).ip

        createAllocationMutation.mutate(
            { node_uuid: node_uuid, ip },
            {
                onSuccess: (response: {
                    data?: { message?: string }
                    message?: string
                }) => {
                    const inner = response?.data?.message
                    toast.success(
                        typeof inner === "string" && inner.length > 0
                            ? inner
                            : "Allocation created.",
                    )
                    void navigate({
                        to: "/admin/nodes/$node_uuid/allocations",
                        params: { node_uuid },
                    })
                },
                onError: (err: unknown) => {
                    const anyErr = err as {
                        response?: { data?: { message?: string } }
                    }
                    toast.error(
                        anyErr.response?.data?.message ??
                        "Failed to create allocation.",
                    )
                },
            },
        )
    })

    if (!node_uuid) {
        return (
            <p className="text-muted-foreground text-sm" role="alert">
                Missing node uuid.
            </p>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-start gap-3">
                <Button variant="ghost" size="sm" className="-ml-2" asChild>
                    <Link
                        to="/admin/nodes/$node_uuid/allocations"
                        params={{ node_uuid }}
                        className="text-muted-foreground gap-1.5"
                    >
                        <ArrowLeft className="size-4" aria-hidden />
                        Back to allocations
                    </Link>
                </Button>
            </div>

            <div>
                <h1 className="text-foreground text-xl font-semibold tracking-tight md:text-2xl">
                    New allocation
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    Add an IP allocation to this node.
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
                                name="ip"
                                render={({ field }) => (
                                    <FormItem className="sm:col-span-2">
                                        <FormLabel>IP address</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                autoComplete="off"
                                                placeholder="0.0.0.0"
                                                disabled={pending}
                                            />
                                        </FormControl>
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
                                            Creating…
                                        </>
                                    ) : (
                                        "Create allocation"
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

export default NodeAllocationCreate
