import AdminLayout from "@/app/(dashboard)/admin/AdminLayout";
import AdminIndexRedirect from "@/app/(dashboard)/admin/AdminIndexRedirect";
import NodeAllocations from "@/app/(dashboard)/admin/nodes/NodeAllocations";
import NodeApiKeys from "@/app/(dashboard)/admin/nodes/NodeApiKeys";
import NodeCreate from "@/app/(dashboard)/admin/nodes/NodeCreate";
import NodeDetail from "@/app/(dashboard)/admin/nodes/NodeDetail";
import NodeEdit from "@/app/(dashboard)/admin/nodes/NodeEdit";
import NodesList from "@/app/(dashboard)/admin/nodes/NodesList";
import NodesListByLocation from "@/app/(dashboard)/admin/nodes/NodesListByLocation";
import ServerEdit from "@/app/(dashboard)/admin/nodes/server/ServerEdit";
import ServerProvision from "@/app/(dashboard)/admin/nodes/server/ServerProvision";
import UserEdit from "@/app/(dashboard)/admin/users/UserEdit";
import UsersList from "@/app/(dashboard)/admin/users/UsersList";
import { authMiddleware } from "@/middleware/authMiddleware";
import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "../_root";
import NodeAllocationCreate from "@/app/(dashboard)/admin/nodes/NodeAllocationCreate";
import ServersList from "@/app/(dashboard)/admin/nodes/server/ServersList";

export const AdminLayoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/admin",
    beforeLoad: async ({ location }) => {
        await authMiddleware(location.pathname);
    },
    component: AdminLayout,
});

export const AdminIndexRoute = createRoute({
    getParentRoute: () => AdminLayoutRoute,
    path: "/",
    component: AdminIndexRedirect,
});

export const AdminUsersListRoute = createRoute({
    getParentRoute: () => AdminLayoutRoute,
    path: "users",
    component: UsersList,
});

export const AdminUserEditRoute = createRoute({
    getParentRoute: () => AdminLayoutRoute,
    path: "users/$user_uuid/edit",
    component: UserEdit,
});

export const AdminNodesListRoute = createRoute({
    getParentRoute: () => AdminLayoutRoute,
    path: "nodes",
    component: NodesList,
});

export const AdminNodeCreateRoute = createRoute({
    getParentRoute: () => AdminLayoutRoute,
    path: "nodes/create",
    component: NodeCreate,
});

export const AdminNodesByLocationRoute = createRoute({
    getParentRoute: () => AdminLayoutRoute,
    path: "nodes/locations/$location_id",
    component: NodesListByLocation,
});

export const AdminNodeDetailRoute = createRoute({
    getParentRoute: () => AdminLayoutRoute,
    path: "nodes/$node_uuid",
    component: NodeDetail,
});

export const AdminNodeEditRoute = createRoute({
    getParentRoute: () => AdminLayoutRoute,
    path: "nodes/$node_uuid/edit",
    component: NodeEdit,
});

export const AdminNodeAllocationsRoute = createRoute({
    getParentRoute: () => AdminLayoutRoute,
    path: "nodes/$node_uuid/allocations",
    component: NodeAllocations,
});

export const AdminNodeAllocationCreateRoute = createRoute({
    getParentRoute: () => AdminLayoutRoute,
    path: "nodes/$node_uuid/allocations/create",
    component: NodeAllocationCreate,
});

export const AdminNodeApiKeysRoute = createRoute({
    getParentRoute: () => AdminLayoutRoute,
    path: "nodes/$node_uuid/api-keys",
    component: NodeApiKeys,
});

export const AdminServersListRoute = createRoute({
    getParentRoute: () => AdminLayoutRoute,
    path: "servers",
    component: ServersList,
});

export const AdminServerProvisionRoute = createRoute({
    getParentRoute: () => AdminLayoutRoute,
    path: "nodes/$node_uuid/servers/provision",
    component: ServerProvision,
});

export const AdminServerEditRoute = createRoute({
    getParentRoute: () => AdminLayoutRoute,
    path: "nodes/$node_uuid/servers/$server_uuid/edit",
    component: ServerEdit,
});

export const adminRouteTree = AdminLayoutRoute.addChildren([
    AdminIndexRoute,
    AdminUsersListRoute,
    AdminUserEditRoute,
    AdminNodesListRoute,
    AdminNodeCreateRoute,
    AdminNodesByLocationRoute,
    AdminNodeDetailRoute,
    AdminNodeEditRoute,
    AdminNodeAllocationsRoute,
    AdminNodeAllocationCreateRoute,
    AdminNodeApiKeysRoute,
    AdminServersListRoute,
    AdminServerProvisionRoute,
    AdminServerEditRoute,
]);
