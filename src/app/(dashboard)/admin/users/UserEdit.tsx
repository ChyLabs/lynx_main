import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate, useParams } from "@tanstack/react-router"
import { ArrowLeft, KeyRound, Loader2, UserRound } from "lucide-react"
import { toast } from "sonner"

import { useUser } from "@/db/queries/useUser"
import {
    updateUserFormSchema,
    type UpdateUserFormValues,
    type UserRecord,
} from "@/validators/user.validator"
import { Badge } from "@/components/ui/badge"
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
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

const UserEdit = () => {
    const navigate = useNavigate()
    const params = useParams({ strict: false })
    const user_uuid = params.user_uuid as string | undefined

    const { getUserByUuid, updateUserMutation } = useUser()
    const { data, isLoading, isError, error } = getUserByUuid(user_uuid ?? "")
    const user = data?.data?.user as UserRecord | undefined

    const form = useForm<UpdateUserFormValues>({
        resolver: zodResolver(updateUserFormSchema),
        defaultValues: {
            first_name: "",
            last_name: "",
            user_name: "",
            email: "",
            password: "",
        },
    })

    useEffect(() => {
        if (!user) return
        form.reset({
            first_name: user.first_name,
            last_name: user.last_name,
            user_name: user.user_name,
            email: user.email,
            password: "",
        })
    }, [user, form.reset])

    const pending = updateUserMutation.isPending

    const onSubmit = form.handleSubmit((values) => {
        if (!user_uuid) return

        const body: UpdateUserFormValues & { user_uuid: string } = {
            user_uuid: user_uuid,
            first_name: values.first_name,
            last_name: values.last_name,
            user_name: values.user_name,
            email: values.email,
        }

        if (values.password && values.password.length > 0) {
            body.password = values.password
        }

        updateUserMutation.mutate(body, {
            onSuccess: () => {
                toast.success("User updated.")
                form.setValue("password", "")
                navigate({ to: "/admin/users" })

            },
            onError: (err: unknown) => {
                const anyErr = err as {
                    response?: { data?: { message?: string } }
                }
                toast.error(
                    anyErr.response?.data?.message ?? "Update failed.",
                )
            },
        })
    })

    if (!user_uuid) {
        return (
            <p className="text-muted-foreground p-6 text-sm" role="alert">
                Missing user uuid.
            </p>
        )
    }

    return (
        <div className="space-y-4 p-6">
            <Button variant="ghost" size="sm" className="-ml-2" asChild>
                <Link to="/admin/users" className="text-muted-foreground gap-1.5">
                    <ArrowLeft className="size-4" aria-hidden />
                    Back to users
                </Link>
            </Button>

            {isLoading ? (
                <div className="space-y-1">
                    <Skeleton className="h-8 w-36 rounded-md" />
                    <Skeleton className="h-4 w-48 rounded-md" />
                </div>
            ) : (
                <div className="flex flex-wrap items-center gap-3">
                    <div>
                        <h1 className="text-foreground text-xl font-semibold tracking-tight md:text-2xl">
                            {user ? `${user.first_name} ${user.last_name}` : "Edit user"}
                        </h1>
                        <p className="text-muted-foreground mt-0.5 text-sm">
                            Update profile details and credentials.
                        </p>
                    </div>
                    {user?.role?.name && (
                        <Badge variant={user.role.name === "ADMIN" ? "default" : "secondary"}>
                            {user.role.name}
                        </Badge>
                    )}
                </div>
            )}

            {isError && (
                <p className="text-destructive text-sm" role="alert">
                    {error instanceof Error ? error.message : "Failed to load user."}
                </p>
            )}

            {!isError && (
                <Form {...form}>
                    <form onSubmit={onSubmit} className="grid gap-4 lg:grid-cols-5" noValidate>

                        {/* Profile card */}
                        <Card className="shadow-sm lg:col-span-3">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <UserRound className="text-muted-foreground size-4" strokeWidth={1.75} />
                                    <CardTitle className="text-sm font-medium">Profile</CardTitle>
                                </div>
                                <CardDescription className="text-xs">
                                    Name, username, and email address.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {isLoading ? (
                                    <>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <div className="space-y-1.5">
                                                <Skeleton className="h-4 w-20" />
                                                <Skeleton className="h-9 w-full rounded-md" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Skeleton className="h-4 w-20" />
                                                <Skeleton className="h-9 w-full rounded-md" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Skeleton className="h-4 w-16" />
                                            <Skeleton className="h-9 w-full rounded-md" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Skeleton className="h-4 w-10" />
                                            <Skeleton className="h-9 w-full rounded-md" />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <FormField
                                                control={form.control}
                                                name="first_name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>First name</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} autoComplete="given-name" disabled={pending} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="last_name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Last name</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} autoComplete="family-name" disabled={pending} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="user_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Username</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} autoComplete="username" disabled={pending} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} type="email" autoComplete="email" disabled={pending} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        {user && (
                                            <p className="text-muted-foreground font-mono text-xs">
                                                ID: {user.id}
                                            </p>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Security card */}
                        <Card className="shadow-sm lg:col-span-2">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <KeyRound className="text-muted-foreground size-4" strokeWidth={1.75} />
                                    <CardTitle className="text-sm font-medium">Security</CardTitle>
                                </div>
                                <CardDescription className="text-xs">
                                    Set a new password for this user.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="space-y-1.5">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-9 w-full rounded-md" />
                                        <Skeleton className="h-3 w-48" />
                                    </div>
                                ) : (
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>New password</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="password"
                                                        autoComplete="new-password"
                                                        placeholder="Leave blank to keep current"
                                                        disabled={pending}
                                                    />
                                                </FormControl>
                                                <FormDescription className="text-xs">
                                                    Leave blank to keep the existing password.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </CardContent>
                        </Card>

                        {/* Submit row */}
                        <div className="lg:col-span-5">
                            <Button
                                type="submit"
                                disabled={pending || isLoading || !user}
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
        </div>
    )
}

export default UserEdit
