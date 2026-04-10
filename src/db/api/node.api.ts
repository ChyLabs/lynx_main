import api from "@/http/xior";
import type { CreateNodeRequest, UpdateNodeRequest } from "@/types/app/node.types";
import type { NodeApiKeyFormValues } from "@/types/app/node.types";

export const nodeApi = {
    getAllNodes: async () => {
        try {
            const response = await api.get("/node/list");
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getNodeByUuid: async (uuid: string) => {
        try {
            const response = await api.get(`/node/${uuid}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    createNode: async (body: CreateNodeRequest) => {
        try {
            const response = await api.post(`/node/create`, body);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    updateNode: async (uuid: string, body: UpdateNodeRequest) => {
        try {
            const response = await api.patch(`/node/update/${uuid}`, body);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    createNodeApiToken: async (uuid: string, body: NodeApiKeyFormValues) => {
        try {
            const response = await api.patch(`/node/api-token/create/${uuid}`, body);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};