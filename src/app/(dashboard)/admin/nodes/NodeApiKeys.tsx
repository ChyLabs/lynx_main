import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useParams } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

import { useNode } from "@/db/queries/useNode"
import {
    nodeApiKeyFormSchema,
    type CreateNodeApiTokenResponseData,
    type NodeApiKeyFormValues,
    type NodeRecord,
} from "@/validators/node.validator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ApiKeyDisplay } from "./_components/ApiKeyDisplay"
import { ApiKeyResult } from "./_components/ApiKeyResult"
import { AgentConfigDisplay } from "./_components/AgentConfigDisplay"
import { ApiKeyRegistrationForm } from "./_components/ApiKeyRegistrationForm"

// Checked
const NodeApiKeys = () => {
    const params = useParams({ strict: false })
    const node_uuid = params.node_uuid as string | undefined

    const { getNodeByUuid, createNodeApiTokenMutation } = useNode()
    const { data, isLoading } = getNodeByUuid(node_uuid ?? "")
    const node = data?.data?.node as NodeRecord | undefined

    const [result, setResult] = useState<CreateNodeApiTokenResponseData | null>(null)

    const form = useForm<NodeApiKeyFormValues>({
        resolver: zodResolver(nodeApiKeyFormSchema),
        defaultValues: { machine_id: "" },
    })

    const pending = createNodeApiTokenMutation.isPending

    const existingKey = node?.api_key ?? null

    const onSubmit = form.handleSubmit((values) => {
        if (!node_uuid) return

        createNodeApiTokenMutation.mutate(
            { uuid: node_uuid, machine_id: values.machine_id },
            {
                onSuccess: (response: {
                    data?: CreateNodeApiTokenResponseData & { message?: string }
                    message?: string
                }) => {
                    const payload = response?.data
                    if (payload) {
                        setResult(payload)
                    }
                    toast.success(
                        payload?.message ?? "API key registered successfully.",
                    )
                    form.reset()
                },
                onError: (err: unknown) => {
                    const anyErr = err as {
                        response?: { data?: { message?: string } }
                    }
                    toast.error(
                        anyErr.response?.data?.message ??
                        "Failed to register API key.",
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
                        to="/admin/nodes/$node_uuid"
                        params={{ node_uuid }}
                        className="text-muted-foreground gap-1.5"
                    >
                        <ArrowLeft className="size-4" aria-hidden />
                        Back to node
                    </Link>
                </Button>
            </div>

            <div>
                <h1 className="text-foreground text-xl font-semibold tracking-tight md:text-2xl">
                    API keys
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    Register the node daemon API key using the machine ID.
                </p>
            </div>

            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                        Current API key
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24 rounded" />
                            <Skeleton className="h-9 w-full rounded-md" />
                        </div>
                    ) : existingKey ? (
                        <>
                            <ApiKeyDisplay apiKey={existingKey} />
                        </>
                    ) : (
                        <p className="text-muted-foreground text-sm">
                            No key registered. Use the form below to register one.
                        </p>
                    )}
                </CardContent>
            </Card>

            {result && <ApiKeyResult result={result} />}

            {!result && node?.config && (
                <AgentConfigDisplay config={node.config} nodeName={node.name} />
            )}

            <ApiKeyRegistrationForm
                form={form}
                onSubmit={onSubmit}
                pending={pending}
                hasExistingKey={!!existingKey}
                isLoading={isLoading}
            />
        </div>
    )
}

export default NodeApiKeys
