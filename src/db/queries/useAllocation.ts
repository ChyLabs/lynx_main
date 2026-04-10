import { allocationApi } from "../api/allocation.api";
import type { CreateAllocationRequest } from "@/types/app/allocation.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useAllocation = () => {
    const queryClient = useQueryClient();

    const getAllAllocationsByNodeId = (node_uuid: string) =>
        useQuery({
            queryFn: () => allocationApi.getAllAllocationsByNodeId(node_uuid),
            queryKey: ["allocations", node_uuid],
        });

    const createAllocationMutation = useMutation({
        mutationFn: (payload: CreateAllocationRequest) =>
            allocationApi.createAllocation(payload),
        mutationKey: ["allocations", "create"],
        onSuccess: (_data, { node_uuid }) => {
            void queryClient.invalidateQueries({
                queryKey: ["allocations", node_uuid],
            });
        },
    });

    return {
        getAllAllocationsByNodeId,
        createAllocationMutation,
    };
};
