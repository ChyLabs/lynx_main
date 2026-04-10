import { useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "@tanstack/react-router"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "@/db/queries/useAuth"
import { registerFormSchema, type RegisterFormValues } from "@/validators/auth.validator"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
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

const Register = () => {
    const navigate = useNavigate()
    const { registerMutation } = useAuth()
    const [showPassword, setShowPassword] = useState(false)

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerFormSchema),
        defaultValues: {
            user_name: "",
            first_name: "",
            last_name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    })

    const onSubmit = (values: RegisterFormValues) => {
        const { confirmPassword, ...registerData } = values
        registerMutation.mutate(registerData, {
            onSuccess: () => {
                navigate({ to: "/dashboard" })
            },
            onError: (err: any) => {
                toast.error((err.response.data.message))
                console.log(err)
            },
        })
    }

    const pending = registerMutation.isPending

    return (
        <div className="bg-background flex min-h-dvh flex-col items-center justify-center p-4">
            <Card className="w-full max-w-100 shadow-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-semibold tracking-tight">
                        Create account
                    </CardTitle>
                    <CardDescription>
                        Enter your details to create a new account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4"
                            noValidate
                        >
                            <FormField
                                control={form.control}
                                name="user_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="text"
                                                autoComplete="username"
                                                placeholder="johndoe"
                                                disabled={pending}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="first_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="text"
                                                    autoComplete="given-name"
                                                    placeholder="John"
                                                    disabled={pending}
                                                />
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
                                                <Input
                                                    {...field}
                                                    type="text"
                                                    autoComplete="family-name"
                                                    placeholder="Doe"
                                                    disabled={pending}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="email"
                                                autoComplete="email"
                                                placeholder="you@example.com"
                                                disabled={pending}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    {...field}
                                                    type={
                                                        showPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    autoComplete="new-password"
                                                    placeholder="••••••••"
                                                    disabled={pending}
                                                    className="pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    tabIndex={-1}
                                                    onClick={() =>
                                                        setShowPassword((s) => !s)
                                                    }
                                                    className="text-muted-foreground hover:text-foreground absolute inset-e-2 top-1/2 -translate-y-1/2 rounded p-1"
                                                    aria-label={
                                                        showPassword
                                                            ? "Hide password"
                                                            : "Show password"
                                                    }
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="size-4" />
                                                    ) : (
                                                        <Eye className="size-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm password</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type={showPassword ? "text" : "password"}
                                                autoComplete="new-password"
                                                placeholder="••••••••"
                                                disabled={pending}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={pending}
                            >
                                {pending ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        Creating account…
                                    </>
                                ) : (
                                    "Create account"
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex flex-col gap-2 border-t pt-6">
                    <p className="text-muted-foreground text-center text-sm">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="text-primary font-medium underline-offset-4 hover:underline"
                        >
                            Sign in
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}

export default Register
