import Cookies from "js-cookie";
import { Fragment, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import {
    Boxes,
    ChevronLeft,
    ChevronRight,
    LayoutDashboard,
    LogOut,
    Menu,
    Server,
    Shield,
    Users,
} from "lucide-react";

const companyName =
    (import.meta.env.VITE_BRAND_NAME as string | undefined) || "Company Name";

const tokenName =
    (import.meta.env.VITE_TOKEN_NAME as string | undefined) || "token";

const SIDEBAR_STORAGE_KEY = "lynx-admin-sidebar-collapsed";

const adminNav = [
    { to: "/admin/nodes" as const, label: "Nodes", icon: Boxes },
    { to: "/admin/servers" as const, label: "Servers", icon: Server },
    { to: "/admin/users" as const, label: "Users", icon: Users },
] as const;

function AdminNavLinks({
    className,
    onNavigate,
    collapsed = false,
}: {
    className?: string;
    onNavigate?: () => void;
    collapsed?: boolean;
}) {
    return (
        <nav
            className={cn("flex flex-col gap-0.5", className)}
            aria-label="Admin sections"
        >
            {!collapsed && (
                <p className="text-muted-foreground/60 mb-1 select-none px-3 text-[0.6875rem] font-semibold tracking-widest uppercase">
                    Management
                </p>
            )}
            {adminNav.map(({ to, label, icon: Icon }) => {
                const item = (
                    <Link
                        to={to}
                        onClick={onNavigate}
                        aria-label={collapsed ? label : undefined}
                        className={cn(
                            "text-muted-foreground flex touch-manipulation items-center rounded-lg font-medium transition-colors",
                            "max-md:min-h-11 max-md:gap-3 max-md:px-3 max-md:py-2 max-md:text-base max-md:active:bg-accent/70",
                            "md:py-2.5 md:text-sm",
                            collapsed
                                ? "md:justify-center md:gap-0 md:px-2"
                                : "md:gap-2 md:px-3",
                            "hover:bg-accent hover:text-foreground",
                        )}
                        activeOptions={{ exact: false }}
                        activeProps={{
                            className: cn(
                                "bg-primary/10 text-primary flex touch-manipulation items-center rounded-lg font-semibold transition-colors",
                                "max-md:min-h-11 max-md:gap-3 max-md:px-3 max-md:py-2 max-md:text-base",
                                "md:py-2.5 md:text-sm",
                                collapsed
                                    ? "md:justify-center md:gap-0 md:px-2"
                                    : "md:gap-2 md:px-3",
                            ),
                        }}
                    >
                        <Icon
                            className={cn(
                                "size-4 shrink-0",
                                collapsed && "md:size-5",
                            )}
                            aria-hidden
                        />
                        <span className={cn(collapsed && "md:sr-only")}>
                            {label}
                        </span>
                    </Link>
                );

                return (
                    <Fragment key={to}>
                        {collapsed ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    {item}
                                </TooltipTrigger>
                                <TooltipContent side="right" sideOffset={8}>
                                    {label}
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            item
                        )}
                    </Fragment>
                );
            })}
        </nav>
    );
}

const AdminLayout = () => {
    const navigate = useNavigate();
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        try {
            return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "1";
        } catch {
            return false;
        }
    });

    const toggleSidebar = useCallback(() => {
        setSidebarCollapsed((prev) => {
            const next = !prev;
            try {
                localStorage.setItem(
                    SIDEBAR_STORAGE_KEY,
                    next ? "1" : "0",
                );
            } catch {
                /* ignore quota / private mode */
            }
            return next;
        });
    }, []);

    const handleLogout = () => {
        Cookies.remove(tokenName);
        navigate({ to: "/" });
    };

    return (
        <div className="bg-muted/25 text-foreground flex h-dvh min-h-0 w-full max-w-[100vw] flex-col overflow-hidden">
            <header className="border-border bg-card/95 supports-backdrop-filter:bg-card/90 sticky top-0 z-50 border-b shadow-sm backdrop-blur-md pt-[env(safe-area-inset-top,0px)]">
                <div className="flex min-h-14 items-center justify-between gap-2 px-[max(0.75rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] sm:gap-4 sm:px-4 md:px-6">
                    <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-11 shrink-0 touch-manipulation md:hidden"
                            aria-label="Open menu"
                            aria-expanded={mobileNavOpen}
                            aria-controls="admin-mobile-nav"
                            onClick={() => setMobileNavOpen(true)}
                        >
                            <Menu className="size-5" />
                        </Button>
                        <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
                            <Shield className="size-5" aria-hidden />
                        </div>
                        <div className="min-w-0">
                            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                                Admin
                            </p>
                            <p className="truncate text-sm font-semibold">
                                {companyName}
                            </p>
                        </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="touch-manipulation h-11 px-3 sm:h-9"
                            asChild
                        >
                            <Link to="/dashboard" aria-label="Panel">
                                <LayoutDashboard
                                    className="size-4 sm:mr-2"
                                    aria-hidden
                                />
                                <span className="hidden sm:inline">Panel</span>
                            </Link>
                        </Button>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-destructive size-11 touch-manipulation sm:size-10"
                                    aria-label="Log out"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="size-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Log out</TooltipContent>
                        </Tooltip>
                    </div>
                </div>
            </header>

            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                <SheetContent
                    id="admin-mobile-nav"
                    side="left"
                    className="flex w-[min(100vw-1rem,20rem)] max-w-[100vw] flex-col p-0 pt-[env(safe-area-inset-top,0px)] pl-[env(safe-area-inset-left,0px)]"
                >
                    <SheetHeader className="border-border border-b p-4 pb-3 text-left">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
                                <Shield className="size-4" aria-hidden />
                            </div>
                            <div className="min-w-0">
                                <SheetTitle className="text-sm leading-tight">
                                    Admin Panel
                                </SheetTitle>
                                <p className="text-muted-foreground truncate text-xs">
                                    {companyName}
                                </p>
                            </div>
                        </div>
                    </SheetHeader>
                    <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
                        <AdminNavLinks
                            className="p-3"
                            onNavigate={() => setMobileNavOpen(false)}
                        />
                    </div>
                </SheetContent>
            </Sheet>

            <div className="flex min-h-0 min-w-0 flex-1">
                <aside
                    className={cn(
                        "border-border bg-card hidden shrink-0 flex-col overflow-hidden border-r transition-[width] duration-200 ease-out md:flex",
                        sidebarCollapsed ? "w-[4.25rem]" : "w-56 md:w-60",
                    )}
                    aria-label={
                        sidebarCollapsed
                            ? "Admin navigation (collapsed)"
                            : "Admin navigation"
                    }
                >
                    <AdminNavLinks
                        collapsed={sidebarCollapsed}
                        className={cn(
                            "min-h-0 flex-1 overflow-y-auto overscroll-y-contain",
                            sidebarCollapsed
                                ? "px-1.5 pt-3 pb-2"
                                : "p-3 pt-4 md:p-4",
                        )}
                    />
                    <div className="border-border shrink-0 border-t p-2">
                        {sidebarCollapsed ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-muted-foreground size-9 w-full touch-manipulation"
                                        aria-label="Expand sidebar"
                                        aria-expanded={false}
                                        onClick={toggleSidebar}
                                    >
                                        <ChevronRight className="size-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="right" sideOffset={8}>
                                    Expand sidebar
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground h-9 w-full touch-manipulation justify-start gap-2 px-3"
                                aria-label="Collapse sidebar"
                                aria-expanded={true}
                                onClick={toggleSidebar}
                            >
                                <ChevronLeft className="size-4 shrink-0" />
                                <span className="text-sm">Collapse</span>
                            </Button>
                        )}
                    </div>
                </aside>
                <main
                    className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain p-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] sm:p-4 md:p-6"
                    style={{ scrollbarGutter: "stable" }}
                >
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
