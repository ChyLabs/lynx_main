import { rootRoute } from "../_root"
import Login from "@/app/(auth)/Login"
import Register from "@/app/(auth)/Register"
import { createRoute } from "@tanstack/react-router"

export const LoginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    validateSearch: (search: Record<string, unknown>) => ({
        redirect:
            typeof search.redirect === "string" ? search.redirect : undefined,
    }),
    component: Login,
})

export const RegisterRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/register",
    component: Register
})