import api from "@/http/xior";
import type { CreateServerPermissionRequest, CreateServerRequest, UpdateServerPayload } from "@/types/app/server.types";

export const serverApi = {

    getAllServers: async () => {
        try {
            const response = await api.get("/server/list");
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getAllServersByUserId: async () => {
        try {
            const response = await api.get("/server/user/list");
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getServerByUuid: async (server_uuid: string) => {
        try {
            const response = await api.get(`/server/${server_uuid}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    startServer: async (node_uuid: string, server_uuid: string) => {
        try {
            const response = await api.patch(`/server/start/${node_uuid}/${server_uuid}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    stopServer: async (node_uuid: string, server_uuid: string) => {
        try {
            const response = await api.patch(`/server/stop/${node_uuid}/${server_uuid}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    restartServer: async (node_uuid: string, server_uuid: string) => {
        try {
            const response = await api.patch(`/server/restart/${node_uuid}/${server_uuid}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    createServer: async (body: CreateServerRequest) => {
        try {
            const response = await api.post(`/server/create`, body);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getServerPermissions: async (server_uuid: string) => {
        try {
            const response = await api.get(`/server/permissions/${server_uuid}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    createServerPermission: async (
        server_uuid: string,
        body: CreateServerPermissionRequest,
    ) => {
        try {
            const response = await api.post(
                `/server/${server_uuid}/permissions/create`,
                body,
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getServerLogs: async (server_uuid: string) => {
        try {
            const response = await api.get(`/server/${server_uuid}/logs`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateServer: async (
        node_uuid: string,
        server_uuid: string,
        body: UpdateServerPayload,
    ) => {
        try {
            const response = await api.patch(
                `/server/update/${node_uuid}/${server_uuid}`,
                body,
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteServer: async (node_uuid: string, server_uuid: string) => {
        try {
            const response = await api.delete(
                `/server/delete/${node_uuid}/${server_uuid}`,
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },
}