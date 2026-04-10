import Cookies from "js-cookie";
import { authApi } from "../api/auth.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useAuth = () => {
    const queryClient = useQueryClient();

    const loginMutation = useMutation({
        mutationKey: ["auth", "login"],
        mutationFn: authApi.login,
        onSuccess: (data) => {
            Cookies.set(`${import.meta.env.VITE_TOKEN_NAME}`, data.data.token, {
                expires: 7,
                sameSite: "lax",
            });
            queryClient.invalidateQueries({ queryKey: ["auth"] });
        },
    });

    const sessionMutation = useQuery({
        queryKey: ["auth", "session"],
        queryFn: authApi.session,
    });

    const registerMutation = useMutation({
        mutationKey: ["auth", "register"],
        mutationFn: authApi.register,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["auth"] });
        },
    });

    return {
        loginMutation,
        sessionMutation,
        registerMutation,
    };
};