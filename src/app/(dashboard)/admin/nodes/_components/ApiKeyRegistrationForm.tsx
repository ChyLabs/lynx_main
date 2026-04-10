import type { UseFormReturn } from "react-hook-form"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { NodeApiKeyFormValues } from "@/validators/node.validator"

interface ApiKeyRegistrationFormProps {
    form: UseFormReturn<NodeApiKeyFormValues>
    onSubmit: (e?: React.BaseSyntheticEvent) => void
    pending: boolean
    hasExistingKey: boolean
    isLoading: boolean
}

export const ApiKeyRegistrationForm = ({
    form,
    onSubmit,
    pending,
    hasExistingKey,
    isLoading,
}: ApiKeyRegistrationFormProps) => {
    const title = isLoading
        ? "Register API key"
        : hasExistingKey
            ? "Replace API key"
            : "Register API key"

    const buttonText = hasExistingKey ? "Replace key" : "Register key"

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={onSubmit}
                        className="grid gap-6 sm:grid-cols-2"
                        noValidate
                    >
                        <FormField
                            control={form.control}
                            name="machine_id"
                            render={({ field }) => (
                                <FormItem className="sm:col-span-2">
                                    <FormLabel>Machine ID</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            autoComplete="off"
                                            placeholder="Run: cat /etc/machine-id"
                                            disabled={pending}
                                            className="font-mono"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <p className="text-muted-foreground text-xs sm:col-span-2">
                            Retrieve the machine ID from the node server by running{" "}
                            <code className="bg-muted rounded px-1 py-0.5 font-mono">
                                cat /etc/machine-id
                            </code>
                            .
                            {hasExistingKey &&
                                " Registering a new key will replace the existing one."}
                        </p>

                        <div className="sm:col-span-2">
                            <Button
                                type="submit"
                                disabled={pending || isLoading}
                                className="touch-manipulation cursor-pointer"
                            >
                                {pending ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        Registering…
                                    </>
                                ) : (
                                    buttonText
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
