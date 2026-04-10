import { serverApi } from "../api/server.api";
import type { Servers } from "@/types/app.types";
import type { CreateServerPermissionRequest, CreateServerRequest, UpdateServerPayload } from "@/types/app/server.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useServer = () => {
    const queryClient = useQueryClient();

    const getAllServers = useQuery({
        queryFn: serverApi.getAllServers,
        queryKey: ["servers", "list"],
    })

    const getAllServersByUserId = useQuery({
        queryFn: serverApi.getAllServersByUserId,
        queryKey: ["servers", "list", "user"],
        refetchInterval: 2000,
        staleTime: 0,
    })

    const getServerByUuid = (server_uuid: string) => useQuery<{ data: { server: Servers } }>({
        queryFn: () => serverApi.getServerByUuid(server_uuid),
        queryKey: ["servers", server_uuid],
        refetchInterval: 2000,
        staleTime: 0,
    })

    const startServerMutation = useMutation({
        mutationFn: (params: { node_uuid: string, server_uuid: string }) =>
            serverApi.startServer(params.node_uuid, params.server_uuid),
        mutationKey: ["servers", "start"]
    })

    const stopServerMutation = useMutation({
        mutationFn: (params: { node_uuid: string, server_uuid: string }) =>
            serverApi.stopServer(params.node_uuid, params.server_uuid),
        mutationKey: ["servers", "stop"]
    })

    const restartServerMutation = useMutation({
        mutationFn: (params: { node_uuid: string, server_uuid: string }) =>
            serverApi.restartServer(params.node_uuid, params.server_uuid),
        mutationKey: ["servers", "restart"]
    })

    const createServerMutation = useMutation({
        mutationFn: (payload: CreateServerRequest) =>
            serverApi.createServer(payload),
        mutationKey: ["servers", "create"],
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["servers", "list"] });
        },
    })

    const getServerPermissions = (server_uuid: string) =>
        useQuery({
            queryFn: () => serverApi.getServerPermissions(server_uuid),
            queryKey: ["servers", server_uuid, "permissions"],
        })

    const getServerLogs = (server_uuid: string) =>
        useQuery({
            queryFn: () => serverApi.getServerLogs(server_uuid),
            queryKey: ["servers", server_uuid, "logs"],
        })

    const createServerPermissionMutation = useMutation({
        mutationFn: (
            params: { server_uuid: string } & CreateServerPermissionRequest,
        ) => {
            const { server_uuid, ...body } = params
            return serverApi.createServerPermission(server_uuid, body)
        },
        mutationKey: ["servers", "permissions", "create"],
        onSuccess: (_data, { server_uuid }) => {
            void queryClient.invalidateQueries({
                queryKey: ["servers", server_uuid, "permissions"],
            })
        },
    })

    const updateServerMutation = useMutation({
        mutationFn: (params: {
            node_uuid: string
            server_uuid: string
            server: UpdateServerPayload
        }) => serverApi.updateServer(params.node_uuid, params.server_uuid, params.server),
        mutationKey: ["servers", "update"],
        onSuccess: (_data, { server_uuid }) => {
            void queryClient.invalidateQueries({ queryKey: ["servers", "list"] })
            void queryClient.invalidateQueries({ queryKey: ["servers", server_uuid] })
        },
    })

    const deleteServerMutation = useMutation({
        mutationFn: (params: { node_uuid: string; server_uuid: string }) =>
            serverApi.deleteServer(params.node_uuid, params.server_uuid),
        mutationKey: ["servers", "delete"],
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["servers", "list"] })
        },
    })

    return {
        getAllServers,
        getAllServersByUserId,
        getServerByUuid,
        stopServerMutation,
        restartServerMutation,
        startServerMutation,
        createServerMutation,
        getServerPermissions,
        createServerPermissionMutation,
        getServerLogs,
        updateServerMutation,
        deleteServerMutation,
    }
}