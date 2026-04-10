import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../api/user.api";
import type { UpdateUserRequest } from "@/validators/user.validator";

export const useUser = () => {
    const queryClient = useQueryClient();

    const getAllUsers = useQuery({
        queryFn: userApi.getAllUsers,
        queryKey: ["users", "list"],
    });

    const getUserByUuid = (user_uuid: string) =>
        useQuery({
            queryFn: () => userApi.getUserByUuid(user_uuid),
            queryKey: ["users", user_uuid],
            enabled: !!user_uuid,
        });

    const updateUserMutation = useMutation({
        mutationFn: (params: { user_uuid: string } & UpdateUserRequest) => {
            const { user_uuid, ...body } = params;
            return userApi.updateUser(user_uuid, body);
        },
        mutationKey: ["users", "update"],
        onSuccess: (_data, { user_uuid }) => {
            void queryClient.invalidateQueries({ queryKey: ["users", "list"] });
            void queryClient.invalidateQueries({ queryKey: ["users", user_uuid] });
        },
    });

    return {
        getAllUsers,
        getUserByUuid,
        updateUserMutation,
    };
};
