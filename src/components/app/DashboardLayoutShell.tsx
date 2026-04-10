import Cookies from "js-cookie";
import { useLayoutEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, Outlet, useMatchRoute, useNavigate, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, LayoutList, LogOut, Search, Server, Settings, User } from "lucide-react";
import { useAuth } from "@/db/queries/useAuth";

const companyName =
    (import.meta.env.VITE_BRAND_NAME as string | undefined) || "Company Name";

export const DashboardLayoutShell = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const { sessionMutation } = useAuth()

    const { data: sessionData } = sessionMutation;

    const user = sessionData?.data?.user

    const matchRoute = useMatchRoute();
    const serverParams = matchRoute({
        to: "/dashboard/servers/$server_uuid",
        fuzzy: true,
    });

    const isServerConsole = Boolean(serverParams) && location.pathname.includes('/servers/');
    const server_uuid = serverParams ? serverParams.server_uuid : undefined;

    const [showSecondaryNav, setShowSecondaryNav] = useState(false);
    const [currentServerUuid, setCurrentServerUuid] = useState<string | undefined>(undefined);

    useLayoutEffect(() => {
        setShowSecondaryNav(isServerConsole);
        setCurrentServerUuid(server_uuid);
    }, [isServerConsole, server_uuid]);

    const tokenName =
        (import.meta.env.VITE_TOKEN_NAME as string | undefined) || "token";

    const handleLogout = () => {
        Cookies.remove(tokenName);
        navigate({ to: "/" });
    };

    return (
        <div className="bg-background flex min-h-dvh flex-col">
            <header className="border-border bg-card/90 supports-backdrop-filter:bg-card/80 sticky top-0 z-50 w-full shadow-sm backdrop-blur-md">
                <div className="mx-auto flex h-18 w-full max-w-300 items-center justify-between gap-4 px-4 md:px-6">
                    <Link
                        to="/dashboard"
                        className="text-foreground shrink-0 text-2xl font-semibold tracking-tight hover:opacity-90"
                    >
                        {companyName}
                    </Link>
                    <nav
                        className="flex shrink-0 items-center gap-2"
                        aria-label="Dashboard toolbar"
                    >
                        {/* <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Search"
                        >
                            <Search className="size-5" />
                        </Button> */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Server list"
                            asChild
                        >
                            <Link to="/dashboard">
                                <Server className="size-5" />
                            </Link>
                        </Button>
                        {/* <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Account"
                        >
                            <User className="size-5" />
                        </Button> */}
                        {user?.role?.name === "ADMIN" && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label="Admin"
                            >
                                <Link to="/admin">
                                    <LayoutDashboard className="size-5" />
                                </Link>
                            </Button>
                        )}
                        {/* <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Settings"
                        >
                            <Settings className="size-5" />
                        </Button> */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Log out"
                            onClick={handleLogout}
                        >
                            <LogOut className="size-5" />
                        </Button>
                    </nav>
                </div>
            </header>

            {showSecondaryNav && currentServerUuid && (
                <section className="bg-background  text-muted-foreground sticky top-18 z-40 w-full border-b supports-backdrop-filter:bg-background/80 backdrop-blur-md">
                    <div className=" mx-auto flex h-16 w-full max-w-300 items-center gap-4 px-4 md:px-6">
                        <nav
                            className="flex flex-wrap items-center gap-10"
                            aria-label="Server sections"
                        >
                            <Link
                                to="/dashboard/servers/$server_uuid"
                                params={{ server_uuid: currentServerUuid }}
                                activeOptions={{ exact: true }}
                                className="text-muted-foreground shrink-0 text-sm font-medium tracking-tight transition-colors hover:text-foreground"
                                activeProps={{
                                    className:
                                        "text-foreground shrink-0 text-sm font-semibold tracking-tight",
                                }}
                            >
                                General
                            </Link>
                            <Link
                                to="/dashboard/servers/$server_uuid/permissions"
                                params={{ server_uuid: currentServerUuid }}
                                activeOptions={{ exact: true }}
                                className="text-muted-foreground shrink-0 text-sm font-medium tracking-tight transition-colors hover:text-foreground"
                                activeProps={{
                                    className:
                                        "text-foreground shrink-0 text-sm font-semibold tracking-tight",
                                }}
                            >
                                Permissions
                            </Link>
                            {/* <Link
                                to="/dashboard/servers/$serverId/schedules"
                                params={{ serverId }}
                                activeOptions={{ exact: true }}
                                className="text-muted-foreground shrink-0 text-sm font-medium tracking-tight transition-colors hover:text-foreground"
                                activeProps={{
                                    className:
                                        "text-foreground shrink-0 text-sm font-semibold tracking-tight",
                                }}
                            >
                                Schedules
                            </Link>
                            <Link
                                to="/dashboard/servers/$serverId/backups"
                                params={{ serverId }}
                                activeOptions={{ exact: true }}
                                className="text-muted-foreground shrink-0 text-sm font-medium tracking-tight transition-colors hover:text-foreground"
                                activeProps={{
                                    className:
                                        "text-foreground shrink-0 text-sm font-semibold tracking-tight",
                                }}
                            >
                                Backups
                            </Link> */}
                            <Link
                                to="/dashboard/servers/$server_uuid/logs"
                                params={{ server_uuid: currentServerUuid }}
                                activeOptions={{ exact: true }}
                                className="text-muted-foreground shrink-0 text-sm font-medium tracking-tight transition-colors hover:text-foreground"
                                activeProps={{
                                    className:
                                        "text-foreground shrink-0 text-sm font-semibold tracking-tight",
                                }}
                            >
                                Logs
                            </Link>
                        </nav>
                    </div>
                </section>
            )}
            <main className="min-h-0 flex-1">
                {children}
            </main>
        </div>
    );
}
