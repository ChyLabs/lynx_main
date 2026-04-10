import { nodeApi } from "../api/node.api";
import type { CreateNodeRequest, NodeApiKeyFormValues, NodeRecord, NodeUpdatePayload } from "@/types/app/node.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useNode = () => {
    const queryClient = useQueryClient();

    const getAllNodes = useQuery({
        queryFn: nodeApi.getAllNodes,
        queryKey: ["nodes", "list"],
    });

    const getNodeByUuid = (node_uuid: string) =>
        useQuery<{ data: { node: NodeRecord } }>({
            queryFn: () => nodeApi.getNodeByUuid(node_uuid),
            queryKey: ["nodes", node_uuid],
        });

    const createNodeMutation = useMutation({
        mutationFn: (payload: CreateNodeRequest) => nodeApi.createNode(payload),
        mutationKey: ["nodes", "create"],
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["nodes", "list"] });
        },
    });

    const updateNodeMutation = useMutation({
        mutationFn: (params: { uuid: string; nodes: NodeUpdatePayload }) =>
            nodeApi.updateNode(params.uuid, { nodes: params.nodes }),
        mutationKey: ["nodes", "update"],
        onSuccess: (_data, { uuid }) => {
            void queryClient.invalidateQueries({ queryKey: ["nodes", "list"] });
            void queryClient.invalidateQueries({ queryKey: ["nodes", uuid] });
        },
    });

    const createNodeApiTokenMutation = useMutation({
        mutationFn: (params: { uuid: string } & NodeApiKeyFormValues) =>
            nodeApi.createNodeApiToken(params.uuid, { machine_id: params.machine_id }),
        mutationKey: ["nodes", "api-token"],
        onSuccess: (_data, { uuid }) => {
            void queryClient.invalidateQueries({ queryKey: ["nodes", uuid] });
        },
    });

    return {
        getAllNodes,
        getNodeByUuid,
        createNodeMutation,
        updateNodeMutation,
        createNodeApiTokenMutation,
    };
};
