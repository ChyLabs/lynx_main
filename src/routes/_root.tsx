import { adminRouteTree } from "./routers/admin.routes";
import {
    DashboardRoute,
    ServerConsoleLayoutRoute,
    ServerGeneralRoute,
    ServerSchedulesRoute,
    ServerBackupsRoute,
    ServerPermissionsRoute,
    ServerLogsRoute,
} from "./routers/dash.routes";
import { authMiddleware } from "@/middleware/authMiddleware";
import { LoginRoute, RegisterRoute } from "./routers/auth.routes";
import { createRootRoute, createRoute, Outlet } from "@tanstack/react-router";
import { DashboardLayoutShell } from "@/components/app/DashboardLayoutShell";
import { useEffect } from "react";

export const rootRoute = createRootRoute({
    component: () => <Outlet />,
});

export const DashboardLayout = createRoute({
    getParentRoute: () => rootRoute,
    path: "/dashboard",
    beforeLoad: async ({ location }) => {
        await authMiddleware(location.pathname);
    },
    component: () => (
        <DashboardLayoutShell>
            <main className="min-h-0 flex-1">
                <Outlet />
            </main>
        </DashboardLayoutShell>
    ),
});


export const routerTree = rootRoute.addChildren([
    DashboardLayout.addChildren([
        DashboardRoute,
        ServerConsoleLayoutRoute.addChildren([
            ServerGeneralRoute,
            ServerPermissionsRoute,
            ServerLogsRoute,
            ServerSchedulesRoute,
            ServerBackupsRoute,
        ]),
    ]),
    adminRouteTree,
    LoginRoute,
    RegisterRoute,
]);
