import { z } from 'zod';

export const ApiErrorResponseSchema = z.object({
    message: z.string(),
    error: z.object({
        statusCode: z.number(),
        rawErrors: z.array(z.string()),
    }),
});

export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;

// API Types

export const NodeStatus = {
    RUNNING: 'RUNNING',
    STOPPED: 'STOPPED',
    SUSPENDED: 'SUSPENDED',
    ERROR: 'ERROR',
    MAINTENANCE: 'MAINTENANCE',
} as const;

export type NodeStatus = typeof NodeStatus[keyof typeof NodeStatus];

export const ServerStatus = {
    INSTALLING: 'INSTALLING',
    RUNNING: 'RUNNING',
    STOPPED: 'STOPPED',
    SUSPENDED: 'SUSPENDED',
    ERROR: 'ERROR',
} as const;

export type ServerStatus = typeof ServerStatus[keyof typeof ServerStatus];

export const Role = {
    ADMIN: 'ADMIN',
    USER: 'USER',
} as const;

export type Role = typeof Role[keyof typeof Role];


export type Users = {
    id: string,
    uuid: string,
    user_name: string,
    first_name: string,
    last_name: string,
    email: string,
    password: string,
    api_keys: ApiKeys[],
    activity_logs: ActivityLogs[],
    role?: Roles,
    role_id?: string,
    created_at: Date,
    updated_at: Date,
}

export type Nodes = {
    id: string,
    uuid: string,
    name: string,
    description?: string,
    location: string,
    location_code: string,
    status: NodeStatus,
    domain?: string,
    host: string,
    port: number,
    api_key?: string,
    memory: number,
    disk: number,
    cpu: number,
    allocations: Allocations[],
    created_at: Date,
    updated_at: Date,
}

export type Servers = {
    id: string,
    uuid: string,
    name: string,
    memory: string,
    cpu: number,
    disk: string,
    status: ServerStatus,
    user_id: string,
    node_id: string,
    node: Nodes
    allocation_id: string,
    allocation: Allocations,
    created_at: Date,
    updated_at: Date,
}

export type Allocations = {
    id: string,
    ip: string,
    node: Nodes,
    node_id: string,
    server_name?: string,
    server_id?: string,
    created_at: Date,
    updated_at: Date,
}

export type ServerBackups = {
    id: string,
    uuid: string,
    name: string,
    file_url: string,
    size: number,
    server_id: string,
    created_at: Date,
    updated_at: Date,
}

export type ServerSchedules = {
    id: string,
    name: string,
    cron: string,
    command: string,
    last_run_at?: Date,
    next_run_at?: Date,
    server_id: string,
    created_at: Date,
    updated_at: Date,
}

export type ActivityLogs = {
    id: string,
    action: string,
    ip: string,
    server_id?: string,
    user?: Users,
    user_id?: string,
    created_at: Date,
    updated_at: Date,
}

export type ApiKeys = {
    id: string,
    name: string,
    description?: string,
    key: string,
    last_used_at?: Date,
    user: Users,
    user_id: string,
    created_at: Date,
    updated_at: Date,
}

export type Roles = {
    id: string,
    name: Role,
    users: Users[],
    created_at: Date,
    updated_at: Date,
}

export type ServerPermission = {
    id: string,
    server_id: string,
    user_id: string,
    can_view: boolean,
    can_start: boolean,
    can_stop: boolean,
    can_restart: boolean,
    can_backup: boolean,
    created_at: Date,
    updated_at: Date,
}


