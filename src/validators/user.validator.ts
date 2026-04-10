import { uuid, z } from 'zod';

export const userRoleSchema = z.object({
    name: z.string(),
});

export const userRecordSchema = z.object({
    id: z.string(),
    uuid: z.string(),
    user_name: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    email: z.string(),
    role: userRoleSchema.nullable().optional(),
    created_at: z.string(),
    updated_at: z.string(),
});

export const userListDataSchema = z.object({
    users: z.array(userRecordSchema),
});

export type UserRole = z.infer<typeof userRoleSchema>;
export type UserRecord = z.infer<typeof userRecordSchema>;
export type UserListData = z.infer<typeof userListDataSchema>;

export const updateUserFormSchema = z.object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    user_name: z.string().min(1, 'Username is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().optional(),
});

export const updateUserRequestSchema = z.object({
    first_name: z.string().min(1).optional(),
    last_name: z.string().min(1).optional(),
    user_name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    password: z.string().min(1).optional(),
});

export type UpdateUserFormValues = z.infer<typeof updateUserFormSchema>;
export type UpdateUserRequest = z.infer<typeof updateUserRequestSchema>;
