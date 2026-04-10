import { z } from 'zod';

export const nodeRecordSchema = z.object({
    id: z.string(),
    uuid: z.string(),
    name: z.string(),
    description: z.string().nullable().optional(),
    location: z.string(),
    location_code: z.string(),
    host: z.string(),
    port: z.number(),
    domain: z.string().nullable().optional(),
    api_key: z.string().nullable().optional(),
    config: z.string().nullable().optional(),
    memory: z.number(),
    disk: z.number(),
    cpu: z.number(),
    created_at: z.string(),
    updated_at: z.string(),
});

export const nodeListDataSchema = z.object({
    nodes: z.array(nodeRecordSchema),
});

export const nodeDetailDataSchema = z.object({
    node: nodeRecordSchema,
});

export const nodeUpdatePayloadSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    location: z.string().min(1, 'Location is required'),
    location_code: z
        .string()
        .min(1, 'Location code is required')
        .max(100, 'Location code is too long'),
    host: z.string().min(1, 'Host is required'),
    port: z
        .number()
        .int('Port must be an integer')
        .min(1, 'Port must be at least 1')
        .max(65535, 'Port must be at most 65535'),
    domain: z.string().optional(),
    memory: z.number().int('Memory must be an integer').min(0, 'Memory must be at least 0'),
    disk: z.number().int('Disk must be an integer').min(0, 'Disk must be at least 0'),
    cpu: z.number().int('CPU must be an integer').min(1, 'CPU must be at least 1'),
});

export const updateNodeRequestSchema = z.object({
    nodes: nodeUpdatePayloadSchema,
});

export const updateNodeResponseDataSchema = z.object({
    node: nodeRecordSchema,
    message: z.string().optional(),
});

export const nodeEditFormSchema = z
    .object({
        name: z.string().min(1, 'Name is required'),
        description: z.string().optional(),
        location: z.string().min(1, 'Location is required'),
        location_code: z.string().min(1, 'Location code is required').max(100, 'Location code is too long'),
        host: z.string().min(1, 'Host is required'),
        port: z.string(),
        domain: z.string().optional(),
        memory: z.string(),
        disk: z.string(),
        cpu: z.string(),
    })
    .transform((data) => ({
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
        location: data.location.trim(),
        location_code: data.location_code.trim(),
        host: data.host.trim(),
        port: Number(data.port),
        domain: data.domain?.trim() || undefined,
        memory: Number(data.memory),
        disk: Number(data.disk),
        cpu: Number(data.cpu),
    }))
    .refine((data) => data.port >= 1 && data.port <= 65535, {
        message: 'Port must be between 1 and 65535',
        path: ['port'],
    })
    .refine((data) => data.memory >= 0, {
        message: 'Memory must be at least 0',
        path: ['memory'],
    })
    .refine((data) => data.disk >= 0, {
        message: 'Disk must be at least 0',
        path: ['disk'],
    })
    .refine((data) => data.cpu >= 1, {
        message: 'CPU must be at least 1',
        path: ['cpu'],
    });

export type NodeRecord = z.infer<typeof nodeRecordSchema>;
export type NodeListApiData = z.infer<typeof nodeListDataSchema>;
export type NodeDetailApiData = z.infer<typeof nodeDetailDataSchema>;
export type NodeUpdatePayload = z.infer<typeof nodeUpdatePayloadSchema>;
export type UpdateNodeRequest = z.infer<typeof updateNodeRequestSchema>;
export type UpdateNodeResponseData = z.infer<typeof updateNodeResponseDataSchema>;
export type NodeEditFormValues = z.input<typeof nodeEditFormSchema>;

export const allocationInputSchema = z.object({
    ip: z.string().min(1, 'IP address is required'),
});

export const createNodeRequestSchema = z.object({
    nodes: nodeUpdatePayloadSchema,
    allocations: z.array(allocationInputSchema),
});

export const createNodeResponseDataSchema = z.object({
    node: nodeRecordSchema,
    allocations: z.array(
        z.object({
            id: z.string(),
            node_id: z.string(),
            ip: z.string(),
        }),
    ),
    message: z.string().optional(),
});

export const nodeCreateFormSchema = z
    .object({
        name: z.string().min(1, 'Name is required'),
        description: z.string().optional(),
        location: z.string().min(1, 'Location is required'),
        location_code: z.string().min(1, 'Location code is required').max(100, 'Location code is too long'),
        host: z.string().min(1, 'Host is required'),
        port: z.string(),
        domain: z.string().optional(),
        memory: z.string(),
        disk: z.string(),
        cpu: z.string(),
        allocations: z.array(z.object({ ip: z.string().min(1, 'IP address is required') })),
    })
    .transform((data) => ({
        nodes: {
            name: data.name.trim(),
            description: data.description?.trim() || undefined,
            location: data.location.trim(),
            location_code: data.location_code.trim(),
            host: data.host.trim(),
            port: Number(data.port),
            domain: data.domain?.trim() || undefined,
            memory: Number(data.memory),
            disk: Number(data.disk),
            cpu: Number(data.cpu),
        },
        allocations: data.allocations.map((a) => ({ ip: a.ip.trim() })),
    }))
    .refine((data) => data.nodes.port >= 1 && data.nodes.port <= 65535, {
        message: 'Port must be between 1 and 65535',
        path: ['port'],
    })
    .refine((data) => data.nodes.memory >= 0, {
        message: 'Memory must be at least 0',
        path: ['memory'],
    })
    .refine((data) => data.nodes.disk >= 0, {
        message: 'Disk must be at least 0',
        path: ['disk'],
    })
    .refine((data) => data.nodes.cpu >= 1, {
        message: 'CPU must be at least 1',
        path: ['cpu'],
    });

export type AllocationInput = z.infer<typeof allocationInputSchema>;
export type CreateNodeRequest = z.infer<typeof createNodeRequestSchema>;
export type CreateNodeResponseData = z.infer<typeof createNodeResponseDataSchema>;
export type NodeCreateFormValues = z.input<typeof nodeCreateFormSchema>;

export const nodeApiKeyFormSchema = z.object({
    machine_id: z.string().min(1, 'Machine ID is required'),
});

export const createNodeApiTokenResponseDataSchema = z.object({
    node_id: z.string(),
    node_name: z.string(),
    machine_id: z.string(),
    encrypted_api_key: z.string(),
    agent_config: z.string(),
    message: z.string().optional(),
});

export type NodeApiKeyFormValues = z.infer<typeof nodeApiKeyFormSchema>;
export type CreateNodeApiTokenResponseData = z.infer<typeof createNodeApiTokenResponseDataSchema>;
