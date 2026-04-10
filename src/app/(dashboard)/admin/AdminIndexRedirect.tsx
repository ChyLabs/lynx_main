import { Navigate } from "@tanstack/react-router";

const AdminIndexRedirect = () => (
    <Navigate to="/admin/nodes" replace />
);

export default AdminIndexRedirect;
