import { z } from 'zod';

export const allocationRecordSchema = z.object({
    id: z.string(),
    uuid: z.string(),
    node_id: z.string(),
    ip: z.string(),
    server_id: z.string().nullable().optional(),
    server_name: z.string().nullable().optional(),
});

export const allocationServerSchema = z.object({
    id: z.string(),
    name: z.string(),
    allocation_id: z.string(),
});

export const allocationWithServerSchema = allocationRecordSchema.extend({
    server: allocationServerSchema.nullable(),
});

export const allocationListDataSchema = z.object({
    node_id: z.string(),
    allocations: z.array(allocationWithServerSchema),
});

export const createAllocationRequestSchema = z.object({
    node_uuid: z.string().min(1, 'Node ID is required'),
    ip: z.string().min(1, 'IP address is required'),
});

export const createAllocationResponseDataSchema = z.object({
    allocation: allocationRecordSchema,
});

export const allocationCreateFormSchema = z
    .object({
        ip: z.string(),
    })
    .transform((data) => ({
        ip: data.ip.trim(),
    }))
    .pipe(
        z.object({
            ip: z.string().min(1, 'IP address is required'),
        }),
    );

export type AllocationRecord = z.infer<typeof allocationRecordSchema>;
export type AllocationServer = z.infer<typeof allocationServerSchema>;
export type AllocationWithServer = z.infer<typeof allocationWithServerSchema>;
export type AllocationListData = z.infer<typeof allocationListDataSchema>;
export type CreateAllocationRequest = z.infer<typeof createAllocationRequestSchema>;
export type CreateAllocationResponseData = z.infer<typeof createAllocationResponseDataSchema>;
export type AllocationCreateFormValues = z.input<typeof allocationCreateFormSchema>;
