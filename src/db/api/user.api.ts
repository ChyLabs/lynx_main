import api from "@/http/xior";
import type { UpdateUserRequest } from "@/validators/user.validator";

export const userApi = {
    getAllUsers: async () => {
        try {
            const response = await api.get("/user/list");
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getUserByUuid: async (user_uuid: string) => {
        try {
            const response = await api.get(`/user/${user_uuid}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateUser: async (user_uuid: string, body: UpdateUserRequest) => {
        try {
            const response = await api.patch(`/user/update/${user_uuid}`, body);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};
