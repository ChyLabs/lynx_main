import api from "@/http/xior";
import type { CreateAllocationRequest } from "@/types/app/allocation.types";

export const allocationApi = {
    getAllAllocationsByNodeId: async (node_uuid: string) => {
        try {
            const response = await api.get(`/allocation/list/${node_uuid}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    createAllocation: async (body: CreateAllocationRequest) => {
        try {
            const response = await api.post(`/allocation/create`, body);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};
