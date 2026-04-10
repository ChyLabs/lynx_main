import { DashboardLayout } from "../_root"
import Dashboard from "@/app/(dashboard)/panel/Dashboard"
import ServerConsoleLayout from "@/app/(dashboard)/panel/ServerConsoleLayout"
import ServerGeneral from "@/app/(dashboard)/panel/ServerGeneral"
import ServerSchedules from "@/app/(dashboard)/panel/ServerSchedules"
import ServerBackups from "@/app/(dashboard)/panel/ServerBackups"
import { createRoute } from "@tanstack/react-router"
import ServerPermissions from "@/app/(dashboard)/panel/ServerPermissions"
import ServerActivityLogs from "@/app/(dashboard)/panel/ServerActivityLogs"

export const DashboardRoute = createRoute({
    getParentRoute: () => DashboardLayout,
    path: "/",
    component: Dashboard
})

export const ServerConsoleLayoutRoute = createRoute({
    getParentRoute: () => DashboardLayout,
    path: "servers/$server_uuid",
    component: ServerConsoleLayout,
})

export const ServerGeneralRoute = createRoute({
    getParentRoute: () => ServerConsoleLayoutRoute,
    path: "/",
    component: ServerGeneral,
})

export const ServerPermissionsRoute = createRoute({
    getParentRoute: () => ServerConsoleLayoutRoute,
    path: "permissions",
    component: ServerPermissions,
})

export const ServerSchedulesRoute = createRoute({
    getParentRoute: () => ServerConsoleLayoutRoute,
    path: "schedules",
    component: ServerSchedules,
})

export const ServerBackupsRoute = createRoute({
    getParentRoute: () => ServerConsoleLayoutRoute,
    path: "backups",
    component: ServerBackups,
})

export const ServerLogsRoute = createRoute({
    getParentRoute: () => ServerConsoleLayoutRoute,
    path: "logs",
    component: ServerActivityLogs,
})

