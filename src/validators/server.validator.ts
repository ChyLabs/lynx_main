import { z } from 'zod';

export const serverStatusSchema = z.enum([
    'INSTALLING',
    'RUNNING',
    'STOPPED',
    'SUSPENDED',
    'ERROR',
]);

export const serverAllocationSchema = z.object({
    id: z.string(),
    ip: z.string(),
    server_id: z.string().nullable().optional(),
    server_name: z.string().nullable().optional(),
});

export const serverRecordSchema = z.object({
    id: z.string(),
    uuid: z.string(),
    name: z.string(),
    memory: z.string(),
    cpu: z.number(),
    disk: z.string(),
    status: serverStatusSchema,
    user_id: z.string(),
    allocation_id: z.string(),
    node_id: z.string(),
    node_uuid: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
    allocation: serverAllocationSchema.nullable().optional(),
});

export const serverListDataSchema = z.object({
    servers: z.array(serverRecordSchema),
    total: z.number(),
    nodes_queried: z.number(),
});

export type ServerStatus = z.infer<typeof serverStatusSchema>;
export type ServerAllocation = z.infer<typeof serverAllocationSchema>;
export type ServerRecord = z.infer<typeof serverRecordSchema>;
export type ServerListData = z.infer<typeof serverListDataSchema>;

export const createServerRequestSchema = z.object({
    node_uuid: z.string().min(1),
    allocation_uuid: z.string().min(1, 'Allocation is required'),
    user_uuid: z.string().min(1, 'User ID is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(1, 'Name is required'),
    distro: z.string().min(1, 'Distribution is required'),
    release: z.string().min(1, 'Release is required'),
    archi: z.string().min(1, 'Architecture is required'),
    memory: z.number().int().min(1, 'Memory must be at least 1 MB'),
    cpu: z.number().int().min(1, 'CPU must be at least 1 core'),
    disk: z.number().int().min(1, 'Disk must be at least 1 MB'),
});

export const serverProvisionFormSchema = z
    .object({
        name: z.string(),
        password: z.string(),
        user_uuid: z.string(),
        distro: z.string(),
        release: z.string(),
        archi: z.string(),
        allocation_uuid: z.string(),
        memory: z.string(),
        cpu: z.string(),
        disk: z.string(),
    })
    .transform((data) => ({
        name: data.name.trim(),
        password: data.password,
        user_uuid: data.user_uuid.trim(),
        distro: data.distro,
        release: data.release,
        archi: data.archi,
        allocation_uuid: data.allocation_uuid,
        memory: Number(data.memory),
        cpu: Number(data.cpu),
        disk: Number(data.disk),
    }))
    .pipe(createServerRequestSchema.omit({ node_uuid: true }));

export const createServerResponseDataSchema = z.object({
    server_uuid: z.string(),
    server_name: z.string(),
    memory: z.string(),
    cpu: z.number(),
    disk: z.string(),
    allocation: z.string(),
    message: z.string().optional(),
});

export type CreateServerRequest = z.infer<typeof createServerRequestSchema>;
export type CreateServerResponseData = z.infer<typeof createServerResponseDataSchema>;
export type ServerProvisionFormValues = z.input<typeof serverProvisionFormSchema>;

export const serverPermissionRecordSchema = z.object({
    user_uuid: z.string(),
    user_id: z.string(),
    can_view: z.boolean(),
    can_start: z.boolean(),
    can_stop: z.boolean(),
    can_restart: z.boolean(),
    can_backup: z.boolean(),
});

export const serverPermissionListDataSchema = z.object({
    server_permissions: z.array(serverPermissionRecordSchema),
});

export const createServerPermissionRequestSchema = z.object({
    user_uuid: z.string().min(1, 'User is required'),
    can_view: z.boolean(),
    can_start: z.boolean(),
    can_stop: z.boolean(),
    can_restart: z.boolean(),
    can_backup: z.boolean(),
});

export const serverPermissionFormSchema = createServerPermissionRequestSchema;

export type ServerPermissionRecord = z.infer<typeof serverPermissionRecordSchema>;
export type ServerPermissionListData = z.infer<typeof serverPermissionListDataSchema>;
export type CreateServerPermissionRequest = z.infer<typeof createServerPermissionRequestSchema>;
export type ServerPermissionFormValues = z.infer<typeof serverPermissionFormSchema>;

export const activityLogRecordSchema = z.object({
    id: z.string(),
    action: z.string(),
    ip: z.string(),
    server_id: z.string().nullable().optional(),
    user_id: z.string().nullable().optional(),
    user: z.object({ user_name: z.string() }).nullable().optional(),
    created_at: z.string(),
    updated_at: z.string(),
});

export const activityLogListDataSchema = z.object({
    logs: z.array(activityLogRecordSchema),
});

export type ActivityLogRecord = z.infer<typeof activityLogRecordSchema>;
export type ActivityLogListData = z.infer<typeof activityLogListDataSchema>;

export const updateServerRequestSchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
    memory: z.number().int().min(1, 'Memory must be at least 1 MB').optional(),
    cpu: z.number().int().min(1, 'CPU must be at least 1 core').optional(),
}).refine((data) => data.name || data.memory || data.cpu, {
    message: 'At least one field must be updated',
});

export const serverEditFormSchema = z
    .object({
        name: z.string().optional(),
        memory: z.string().optional(),
        cpu: z.string().optional(),
    })
    .transform((data) => ({
        name: data.name?.trim() || undefined,
        memory: data.memory ? Number(data.memory) : undefined,
        cpu: data.cpu ? Number(data.cpu) : undefined,
    }))
    .refine((data) => data.name || data.memory || data.cpu, {
        message: 'At least one field must be updated',
    })
    .refine((data) => !data.name || data.name.length >= 1, {
        message: 'Name is required',
        path: ['name'],
    })
    .refine((data) => !data.memory || data.memory >= 1, {
        message: 'Memory must be at least 1 MB',
        path: ['memory'],
    })
    .refine((data) => !data.cpu || data.cpu >= 1, {
        message: 'CPU must be at least 1 core',
        path: ['cpu'],
    });

export type UpdateServerRequest = z.infer<typeof updateServerRequestSchema>;
export type UpdateServerPayload = UpdateServerRequest;
export type ServerEditFormValues = z.input<typeof serverEditFormSchema>;
