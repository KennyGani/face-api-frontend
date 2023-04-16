export interface AuthenticatedUser {
    email: string;
    last_ip: string;
    last_login: string;
    logins_count: string;
    name: string;
    nickname: string;
    user_id: string;
    user_metadata: Record<string, string> | { tag: string };
    app_metadata: Record<string, string> | { role: string; appKey: string };
}
