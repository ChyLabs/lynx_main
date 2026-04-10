import { authApi } from "@/db/api/auth.api";
import { redirect } from "@tanstack/react-router";

interface AuthSuccessResponse {
    [key: string]: unknown;
}

const PUBLIC_PATHS = new Set<string>(["/", "/login", "/register"]);

export const authMiddleware = async (
    pathname: string,
): Promise<AuthSuccessResponse | null> => {
    if (PUBLIC_PATHS.has(pathname)) {
        return null;
    }

    try {
        const response = await authApi.session();
        return response.data as AuthSuccessResponse;
    } catch (error: unknown) {
        const status =
            error && typeof error === "object" && "response" in error
                ? (error as { response?: { status?: number } }).response?.status
                : undefined;
        if (status === 401) {
            throw redirect({
                to: "/",
                search: { redirect: pathname },
            });
        }
        throw error;
    }
};
